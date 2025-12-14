/**
 * Chart Export Utilities
 * 
 * Utilities for exporting charts as PNG, SVG, and PDF with metadata
 */

import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'
import { format } from 'date-fns'

export type ExportFormat = 'png' | 'svg' | 'pdf'

export interface ChartExportOptions {
    title?: string
    description?: string
    filename?: string
    includeMetadata?: boolean
    includeTimestamp?: boolean
    backgroundColor?: string
    width?: number
    height?: number
    quality?: number
}

/**
 * Export chart as PNG
 */
export async function exportChartAsPNG(
    element: HTMLElement,
    options: ChartExportOptions = {}
): Promise<void> {
    const {
        title,
        description,
        filename = 'chart',
        includeMetadata = true,
        includeTimestamp = true,
        backgroundColor = '#ffffff',
        quality = 1,
    } = options

    try {
        // Create canvas from element
        const canvas = await html2canvas(element, {
            backgroundColor,
            scale: quality === 1 ? 2 : quality, // Higher scale for better quality
            logging: false,
            useCORS: true,
            allowTaint: false,
        })

        // Create a new canvas for final image with metadata
        const finalCanvas = document.createElement('canvas')
        const ctx = finalCanvas.getContext('2d')
        if (!ctx) throw new Error('Failed to get canvas context')

        // Calculate dimensions
        const padding = includeMetadata ? 60 : 0
        const metadataHeight = includeMetadata ? 50 : 0
        finalCanvas.width = canvas.width
        finalCanvas.height = canvas.height + padding

        // Fill background
        ctx.fillStyle = backgroundColor
        ctx.fillRect(0, 0, finalCanvas.width, finalCanvas.height)

        // Add metadata if requested
        if (includeMetadata) {
            ctx.fillStyle = '#000000'
            ctx.font = 'bold 16px Arial'
            ctx.textAlign = 'left'
            ctx.textBaseline = 'top'

            let y = 10
            if (title) {
                ctx.fillText(title, 10, y)
                y += 20
            }
            if (description) {
                ctx.font = '12px Arial'
                ctx.fillStyle = '#666666'
                ctx.fillText(description, 10, y)
                y += 15
            }
            if (includeTimestamp) {
                ctx.font = '10px Arial'
                ctx.fillStyle = '#999999'
                ctx.fillText(
                    `Exported: ${format(new Date(), 'PPpp')}`,
                    10,
                    y
                )
            }
        }

        // Draw chart below metadata
        ctx.drawImage(canvas, 0, padding)

        // Convert to blob and download
        finalCanvas.toBlob((blob) => {
            if (!blob) {
                throw new Error('Failed to create blob')
            }
            const url = URL.createObjectURL(blob)
            const link = document.createElement('a')
            link.href = url
            link.download = `${filename}-${format(new Date(), 'yyyy-MM-dd')}.png`
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)
            URL.revokeObjectURL(url)
        }, 'image/png')
    } catch (error) {
        console.error('Failed to export chart as PNG:', error)
        throw error
    }
}

/**
 * Export chart as SVG
 */
export async function exportChartAsSVG(
    element: HTMLElement,
    options: ChartExportOptions = {}
): Promise<void> {
    const {
        title,
        description,
        filename = 'chart',
        includeMetadata = true,
        includeTimestamp = true,
    } = options

    try {
        // Find SVG element within the chart container
        const svgElement = element.querySelector('svg')
        if (!svgElement) {
            throw new Error('No SVG element found in chart')
        }

        // Clone the SVG
        const clonedSvg = svgElement.cloneNode(true) as SVGElement

        // Get SVG dimensions from viewBox or attributes
        const viewBox = svgElement.getAttribute('viewBox')
        let svgWidth = 800
        let svgHeight = 400
        
        if (viewBox) {
            const [, , w, h] = viewBox.split(' ').map(Number)
            svgWidth = w || 800
            svgHeight = h || 400
        } else {
            const svgRect = svgElement.getBoundingClientRect()
            svgWidth = svgRect.width || parseInt(svgElement.getAttribute('width') || '800')
            svgHeight = svgRect.height || parseInt(svgElement.getAttribute('height') || '400')
        }
        
        // Ensure SVG has proper dimensions
        clonedSvg.setAttribute('width', String(svgWidth))
        clonedSvg.setAttribute('height', String(svgHeight))
        if (!clonedSvg.getAttribute('viewBox')) {
            clonedSvg.setAttribute('viewBox', `0 0 ${svgWidth} ${svgHeight}`)
        }

        // Create wrapper SVG with metadata
        const wrapperSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
        wrapperSvg.setAttribute('width', String(svgWidth))
        wrapperSvg.setAttribute('height', String(includeMetadata ? svgHeight + 60 : svgHeight))
        wrapperSvg.setAttribute('xmlns', 'http://www.w3.org/2000/svg')

        // Add metadata as text elements
        if (includeMetadata) {
            const metadataGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g')
            
            if (title) {
                const titleText = document.createElementNS('http://www.w3.org/2000/svg', 'text')
                titleText.setAttribute('x', '10')
                titleText.setAttribute('y', '20')
                titleText.setAttribute('font-family', 'Arial, sans-serif')
                titleText.setAttribute('font-size', '16')
                titleText.setAttribute('font-weight', 'bold')
                titleText.setAttribute('fill', '#000000')
                titleText.textContent = title
                metadataGroup.appendChild(titleText)
            }

            if (description) {
                const descText = document.createElementNS('http://www.w3.org/2000/svg', 'text')
                descText.setAttribute('x', '10')
                descText.setAttribute('y', '40')
                descText.setAttribute('font-family', 'Arial, sans-serif')
                descText.setAttribute('font-size', '12')
                descText.setAttribute('fill', '#666666')
                descText.textContent = description
                metadataGroup.appendChild(descText)
            }

            if (includeTimestamp) {
                const timestampText = document.createElementNS('http://www.w3.org/2000/svg', 'text')
                timestampText.setAttribute('x', '10')
                timestampText.setAttribute('y', '55')
                timestampText.setAttribute('font-family', 'Arial, sans-serif')
                timestampText.setAttribute('font-size', '10')
                timestampText.setAttribute('fill', '#999999')
                timestampText.textContent = `Exported: ${format(new Date(), 'PPpp')}`
                metadataGroup.appendChild(timestampText)
            }

            wrapperSvg.appendChild(metadataGroup)
        }

        // Translate and append the chart SVG
        const chartGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g')
        chartGroup.setAttribute('transform', `translate(0, ${includeMetadata ? 60 : 0})`)
        chartGroup.appendChild(clonedSvg)
        wrapperSvg.appendChild(chartGroup)

        // Convert to blob and download
        const svgString = new XMLSerializer().serializeToString(wrapperSvg)
        const blob = new Blob([svgString], { type: 'image/svg+xml' })
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = `${filename}-${format(new Date(), 'yyyy-MM-dd')}.svg`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        URL.revokeObjectURL(url)
    } catch (error) {
        console.error('Failed to export chart as SVG:', error)
        throw error
    }
}

/**
 * Export chart as PDF
 */
export async function exportChartAsPDF(
    element: HTMLElement,
    options: ChartExportOptions = {}
): Promise<void> {
    const {
        title,
        description,
        filename = 'chart',
        includeMetadata = true,
        includeTimestamp = true,
        backgroundColor = '#ffffff',
        width = 210, // A4 width in mm
        height = 297, // A4 height in mm
    } = options

    try {
        // Create canvas from element
        const canvas = await html2canvas(element, {
            backgroundColor,
            scale: 2,
            logging: false,
            useCORS: true,
            allowTaint: false,
        })

        // Calculate dimensions
        const imgWidth = width
        const imgHeight = (canvas.height * imgWidth) / canvas.width

        // Create PDF
        const pdf = new jsPDF({
            orientation: imgHeight > height ? 'portrait' : 'landscape',
            unit: 'mm',
            format: [width, Math.max(height, imgHeight + (includeMetadata ? 30 : 0))],
        })

        // Add metadata
        if (includeMetadata) {
            pdf.setFontSize(16)
            pdf.setFont('helvetica', 'bold')
            if (title) {
                pdf.text(title, 10, 10)
            }
            pdf.setFontSize(12)
            pdf.setFont('helvetica', 'normal')
            if (description) {
                pdf.setTextColor(100, 100, 100)
                pdf.text(description, 10, title ? 18 : 10)
            }
            if (includeTimestamp) {
                pdf.setFontSize(10)
                pdf.setTextColor(150, 150, 150)
                pdf.text(
                    `Exported: ${format(new Date(), 'PPpp')}`,
                    10,
                    title ? (description ? 26 : 18) : (description ? 18 : 10)
                )
            }
            pdf.setTextColor(0, 0, 0)
        }

        // Add chart image
        const imgData = canvas.toDataURL('image/png')
        const metadataOffset = includeMetadata ? 30 : 0
        pdf.addImage(imgData, 'PNG', 10, metadataOffset, imgWidth - 20, imgHeight)

        // Save PDF
        pdf.save(`${filename}-${format(new Date(), 'yyyy-MM-dd')}.pdf`)
    } catch (error) {
        console.error('Failed to export chart as PDF:', error)
        throw error
    }
}

/**
 * Export chart in specified format
 */
export async function exportChart(
    element: HTMLElement,
    format: ExportFormat,
    options: ChartExportOptions = {}
): Promise<void> {
    switch (format) {
        case 'png':
            await exportChartAsPNG(element, options)
            break
        case 'svg':
            await exportChartAsSVG(element, options)
            break
        case 'pdf':
            await exportChartAsPDF(element, options)
            break
        default:
            throw new Error(`Unsupported export format: ${format}`)
    }
}

