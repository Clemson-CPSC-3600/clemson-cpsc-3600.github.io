/**
 * LatencyVisualizer - Visualizes latency breakdown and timing information
 * Creates bar charts and timing diagrams for network delays
 */

import { NetworkFormatter } from '../../../../shared/utils/NetworkFormatter.js';
import { COLORS } from '../../../../shared/constants/colors.js';

export class LatencyVisualizer {
  constructor(ctx, width, height, canvasHelper) {
    this.ctx = ctx;
    this.width = width;
    this.height = height;
    this.canvasHelper = canvasHelper;
    
    // Visual configuration
    this.chartHeight = 120;
    this.chartY = 320; // Fixed position closer to network viz
    this.barWidth = 40;
    this.barSpacing = 10;
    
    // Store bar regions for hover detection
    this.barRegions = [];
    this.hoveredBar = null;
    
    // Delay type colors - use DELAYS colors which are specifically for this
    this.delayColors = {
      transmission: COLORS.DELAYS.TRANSMISSION || '#e74c3c',  // Red
      propagation: COLORS.DELAYS.PROPAGATION || '#3498db',    // Blue
      processing: COLORS.DELAYS.PROCESSING || '#f39c12',      // Yellow-orange
      queuing: COLORS.DELAYS.QUEUING || '#9b59b6'            // Purple
    };
    
    // Legend configuration
    this.legendItems = [
      { type: 'transmission', label: 'Transmission', color: this.delayColors.transmission },
      { type: 'propagation', label: 'Propagation', color: this.delayColors.propagation },
      { type: 'processing', label: 'Processing', color: this.delayColors.processing },
      { type: 'queuing', label: 'Queuing', color: this.delayColors.queuing }
    ];
  }
  
  /**
   * Main render method for latency visualization
   */
  render(latencyData, nodePositions) {
    if (!latencyData || latencyData.length === 0) return;
    
    // Draw chart background
    this.drawChartBackground();
    
    // Draw delay breakdown bars
    this.drawDelayBars(latencyData, nodePositions);
    
    // Draw legend
    this.drawLegend();
    
    // Draw summary statistics
    this.drawSummaryStats(latencyData);
  }
  
  /**
   * Draw chart background and grid
   */
  drawChartBackground() {
    // Background - adjusted left margin for Y-axis labels
    this.ctx.fillStyle = 'rgba(240, 240, 240, 0.5)';
    this.ctx.fillRect(55, this.chartY, this.width - 75, this.chartHeight);
    
    // Grid lines
    this.ctx.strokeStyle = 'rgba(200, 200, 200, 0.5)';
    this.ctx.lineWidth = 1;
    this.ctx.setLineDash([5, 5]);
    
    // Horizontal grid lines
    for (let i = 0; i <= 4; i++) {
      const y = this.chartY + (this.chartHeight * i / 4);
      this.ctx.beginPath();
      this.ctx.moveTo(55, y);
      this.ctx.lineTo(this.width - 20, y);
      this.ctx.stroke();
    }
    
    this.ctx.setLineDash([]);
    
    // Chart title
    this.ctx.fillStyle = COLORS.UI.TEXT;
    this.ctx.font = 'bold 14px sans-serif';
    this.ctx.textAlign = 'left';
    this.ctx.textBaseline = 'bottom';
    this.ctx.fillText('Latency Breakdown by Hop', 60, this.chartY - 5);
  }
  
  /**
   * Draw delay breakdown bars for each hop
   */
  drawDelayBars(latencyData, nodePositions) {
    // Clear previous bar regions
    this.barRegions = [];
    
    // Calculate maximum delay for scaling
    const maxDelay = Math.max(...latencyData.map(d => 
      d.delays ? d.delays.total : 0
    ));
    
    // Add padding to max for better visualization
    const scaledMax = maxDelay * 1.2;
    
    // Dynamically calculate bar spacing and width based on number of nodes
    const numBars = Math.min(latencyData.length - 1, nodePositions.length - 1);
    const chartStartX = 80; // Start position for chart
    const chartEndX = this.width - 80; // End position for chart
    const availableWidth = chartEndX - chartStartX;
    
    // Calculate dynamic spacing between bars
    const maxSpacing = 100; // Maximum spacing between bars
    const minSpacing = 50;  // Minimum spacing between bars
    const idealSpacing = numBars > 1 ? availableWidth / numBars : availableWidth / 2;
    const dynamicSpacing = Math.min(maxSpacing, Math.max(minSpacing, idealSpacing));
    
    // Calculate bar width based on spacing
    const maxBarWidth = 40; // Maximum bar width
    const minBarWidth = 20; // Minimum bar width
    const dynamicBarWidth = Math.min(maxBarWidth, Math.max(minBarWidth, dynamicSpacing * 0.5));
    
    // Center the bars in the available space
    const totalBarsWidth = (numBars - 1) * dynamicSpacing + dynamicBarWidth;
    const startX = (this.width - totalBarsWidth) / 2;
    
    console.log('📊 Drawing delay bars:', {
      maxDelay,
      scaledMax,
      dataCount: latencyData.length,
      nodeCount: nodePositions.length,
      numBars,
      availableWidth,
      dynamicSpacing,
      barWidth: dynamicBarWidth,
      startX
    });
    
    latencyData.forEach((data, index) => {
      if (!data.delays || index >= numBars) return;
      
      console.log(`  Bar ${index} for ${data.node}:`, {
        transmission: data.delays.transmission,
        propagation: data.delays.propagation,
        processing: data.delays.processing,
        queuing: data.delays.queuing,
        total: data.delays.total
      });
      
      // Calculate bar position based on dynamic spacing
      const x = startX + (index * dynamicSpacing) - dynamicBarWidth / 2;
      
      // Draw stacked bars for each delay type
      let currentY = this.chartY + this.chartHeight;
      
      const delayTypes = ['transmission', 'propagation', 'processing', 'queuing'];
      
      // First pass: check which delays exist and calculate minimum heights
      const visibleDelays = [];
      let totalMinHeight = 0;
      delayTypes.forEach(type => {
        const delay = data.delays[type] || 0;
        if (delay > 0) {
          const actualHeight = (delay / scaledMax) * this.chartHeight;
          // Minimum 3px height for visibility, but only if delay exists
          const minHeight = Math.max(actualHeight, 3);
          visibleDelays.push({ type, delay, actualHeight, minHeight });
          totalMinHeight += minHeight;
        }
      });
      
      // Scale down if minimum heights exceed chart height
      const scaleFactor = totalMinHeight > this.chartHeight ? this.chartHeight / totalMinHeight : 1;
      
      // Store bar region for hover detection
      const barRegion = {
        x: x,
        y: this.chartY,
        width: dynamicBarWidth,
        height: this.chartHeight,
        node: data.node,
        index: index,
        delays: []
      };
      
      // Second pass: draw the bars
      visibleDelays.forEach(({ type, delay, actualHeight, minHeight }) => {
        const barHeight = minHeight * scaleFactor;
        console.log(`    ${type}: delay=${delay}ms, actual=${actualHeight.toFixed(2)}px, shown=${barHeight.toFixed(2)}px`);
        
        // Store this segment info for hover
        barRegion.delays.push({
          type: type,
          value: delay,
          y: currentY - barHeight,
          height: barHeight,
          color: this.delayColors[type]
        });
        
        // Draw bar with minimum height for visibility
        this.ctx.fillStyle = this.delayColors[type];
        this.ctx.fillRect(x, currentY - barHeight, dynamicBarWidth, barHeight);
        
        // Add a thin border for very small bars to make them more visible
        if (actualHeight < 3) {
          this.ctx.strokeStyle = this.delayColors[type];
          this.ctx.lineWidth = 0.5;
          this.ctx.strokeRect(x, currentY - barHeight, dynamicBarWidth, barHeight);
        }
        
        currentY -= barHeight;
      });
      
      // Add total delay info
      barRegion.total = data.delays.total;
      this.barRegions.push(barRegion);
      
      // Draw total on top of bar
      if (data.delays.total > 0) {
        this.ctx.fillStyle = COLORS.UI.TEXT;
        this.ctx.font = 'bold 11px sans-serif';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'bottom';
        this.ctx.fillText(
          NetworkFormatter.time(data.delays.total),
          x + dynamicBarWidth / 2,
          currentY - 5
        );
      }
      
      // Draw node label below bar
      this.ctx.fillStyle = COLORS.UI.TEXT_SECONDARY;
      this.ctx.font = '10px sans-serif';
      this.ctx.textAlign = 'center';
      this.ctx.textBaseline = 'top';
      this.ctx.fillText(
        data.node,
        x + dynamicBarWidth / 2,
        this.chartY + this.chartHeight + 5
      );
    });
    
    // Draw Y-axis labels
    this.drawYAxisLabels(scaledMax);
  }
  
  /**
   * Draw Y-axis labels
   */
  drawYAxisLabels(maxValue) {
    this.ctx.save();
    this.ctx.fillStyle = COLORS.UI.TEXT_SECONDARY;
    this.ctx.font = '9px sans-serif';  // Smaller font
    this.ctx.textAlign = 'right';
    this.ctx.textBaseline = 'middle';
    
    for (let i = 0; i <= 4; i++) {
      const value = maxValue * (1 - i / 4);
      const y = this.chartY + (this.chartHeight * i / 4);
      
      // Format based on scale - use microseconds for very small values
      let label;
      if (maxValue < 1) {
        // Use microseconds for sub-millisecond values
        label = `${(value * 1000).toFixed(1)}μs`;
      } else if (maxValue < 10) {
        label = `${value.toFixed(2)}ms`;
      } else if (maxValue < 100) {
        label = `${value.toFixed(1)}ms`;
      } else {
        label = `${value.toFixed(0)}ms`;
      }
      
      this.ctx.fillText(
        label,
        50,  // Move further right to ensure full visibility
        y
      );
    }
    this.ctx.restore();
  }
  
  /**
   * Draw cumulative delay line
   */
  drawCumulativeLine(latencyData, nodePositions) {
    if (nodePositions.length < 2) return;
    
    // Calculate maximum cumulative delay for scaling
    const maxCumulative = Math.max(...latencyData.map(d => d.cumulativeDelay || 0));
    const scaledMax = maxCumulative * 1.2;
    
    // Draw line
    this.ctx.strokeStyle = COLORS.STATUS.ERROR;
    this.ctx.lineWidth = 2;
    this.ctx.setLineDash([]);
    this.ctx.beginPath();
    
    let firstPoint = true;
    latencyData.forEach((data, index) => {
      if (index >= nodePositions.length) return;
      
      const pos = nodePositions[index];
      const y = this.chartY + this.chartHeight - 
                (data.cumulativeDelay / scaledMax) * this.chartHeight;
      
      if (firstPoint) {
        this.ctx.moveTo(pos.x, y);
        firstPoint = false;
      } else {
        this.ctx.lineTo(pos.x, y);
      }
      
      // Draw point
      this.ctx.fillStyle = COLORS.STATUS.ERROR;
      this.ctx.beginPath();
      this.ctx.arc(pos.x, y, 4, 0, Math.PI * 2);
      this.ctx.fill();
    });
    
    this.ctx.stroke();
    
    // Add cumulative line label
    const lastData = latencyData[latencyData.length - 1];
    const lastPos = nodePositions[nodePositions.length - 1];
    if (lastData && lastPos) {
      const y = this.chartY + this.chartHeight - 
                (lastData.cumulativeDelay / scaledMax) * this.chartHeight;
      
      this.ctx.fillStyle = COLORS.STATUS.ERROR;
      this.ctx.font = 'bold 12px sans-serif';
      this.ctx.textAlign = 'left';
      this.ctx.textBaseline = 'middle';
      this.ctx.fillText(
        'Cumulative: ' + NetworkFormatter.time(lastData.cumulativeDelay),
        lastPos.x + 10,
        y
      );
    }
  }
  
  /**
   * Draw legend for delay types
   */
  drawLegend() {
    const legendX = 25;
    const legendY = this.chartY + this.chartHeight + 15;
    const itemWidth = 130;
    
    this.ctx.save();
    
    // Draw legend title
    this.ctx.fillStyle = COLORS.UI.TEXT;
    this.ctx.font = 'bold 11px sans-serif';
    this.ctx.textAlign = 'left';
    this.ctx.fillText('Delay Components:', legendX, legendY - 18);
    
    this.legendItems.forEach((item, index) => {
      const x = legendX + (index * itemWidth);
      
      // Draw larger, more visible color box with border
      this.ctx.fillStyle = item.color;
      this.ctx.fillRect(x, legendY, 16, 16);
      
      // Add border to make colors more distinct
      this.ctx.strokeStyle = '#333';
      this.ctx.lineWidth = 1;
      this.ctx.strokeRect(x, legendY, 16, 16);
      
      // Draw label with better contrast
      this.ctx.fillStyle = COLORS.UI.TEXT;
      this.ctx.font = '11px sans-serif';
      this.ctx.textAlign = 'left';
      this.ctx.textBaseline = 'middle';
      this.ctx.fillText(item.label, x + 20, legendY + 8);
    });
    
    this.ctx.restore();
  }
  
  /**
   * Draw summary statistics
   */
  drawSummaryStats(latencyData) {
    const stats = this.calculateStats(latencyData);
    
    // Position in top left
    const statsX = 25;
    const statsY = 25;
    const lineHeight = 18;
    
    // Background
    this.ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    this.ctx.strokeStyle = COLORS.UI.BORDER_LIGHT;
    this.ctx.lineWidth = 1;
    this.ctx.fillRect(statsX, statsY, 200, 100);
    this.ctx.strokeRect(statsX, statsY, 200, 100);
    
    // Title
    this.ctx.fillStyle = COLORS.UI.TEXT;
    this.ctx.font = 'bold 12px sans-serif';
    this.ctx.textAlign = 'left';
    this.ctx.textBaseline = 'top';
    this.ctx.fillText('Journey Statistics', statsX + 10, statsY + 8);
    
    // Stats
    this.ctx.font = '11px sans-serif';
    this.ctx.fillStyle = COLORS.UI.TEXT_SECONDARY;
    
    const statsItems = [
      { label: 'Total Latency:', value: NetworkFormatter.time(stats.total) },
      { label: 'Average per Hop:', value: NetworkFormatter.time(stats.average) },
      { label: 'Largest Delay:', value: `${NetworkFormatter.time(stats.max)} (${stats.maxType})` },
      { label: 'Network Hops:', value: stats.hopCount.toString() }
    ];
    
    statsItems.forEach((item, index) => {
      const y = statsY + 30 + (index * lineHeight);
      
      // Label
      this.ctx.textAlign = 'left';
      this.ctx.fillText(item.label, statsX + 10, y);
      
      // Value
      this.ctx.textAlign = 'right';
      this.ctx.fillStyle = COLORS.UI.TEXT;
      this.ctx.font = 'bold 11px sans-serif';
      this.ctx.fillText(item.value, statsX + 190, y);
      
      // Reset for next item
      this.ctx.fillStyle = COLORS.UI.TEXT_SECONDARY;
      this.ctx.font = '11px sans-serif';
    });
  }
  
  /**
   * Calculate summary statistics
   */
  calculateStats(latencyData) {
    const total = latencyData[latencyData.length - 1]?.cumulativeDelay || 0;
    const hopCount = latencyData.length - 1; // Exclude last node
    const average = hopCount > 0 ? total / hopCount : 0;
    
    // Find largest delay component
    let maxDelay = 0;
    let maxType = '';
    
    latencyData.forEach(data => {
      if (!data.delays) return;
      
      Object.entries(data.delays).forEach(([type, value]) => {
        if (type !== 'total' && value > maxDelay) {
          maxDelay = value;
          maxType = type.charAt(0).toUpperCase() + type.slice(1);
        }
      });
    });
    
    return {
      total,
      average,
      max: maxDelay,
      maxType,
      hopCount
    };
  }
  
  /**
   * Check if mouse is over a bar and show tooltip
   */
  checkHover(mouseX, mouseY) {
    // Check if mouse is over any bar
    for (const bar of this.barRegions) {
      if (mouseX >= bar.x && mouseX <= bar.x + bar.width &&
          mouseY >= bar.y && mouseY <= bar.y + bar.height) {
        
        // Found a hovered bar
        if (this.hoveredBar !== bar) {
          this.hoveredBar = bar;
          return bar;
        }
        return this.hoveredBar;
      }
    }
    
    // No bar hovered
    this.hoveredBar = null;
    return null;
  }
  
  /**
   * Draw tooltip for hovered bar
   */
  drawBarTooltip(bar, mouseX, mouseY) {
    if (!bar || !bar.delays) return;
    
    // Calculate tooltip dimensions
    const padding = 8;
    const lineHeight = 16;
    const lines = bar.delays.length + 2; // +2 for title and total
    const tooltipHeight = padding * 2 + lines * lineHeight;
    const tooltipWidth = 150;
    
    // Position tooltip (to the right of mouse, or left if too close to edge)
    let tooltipX = mouseX + 10;
    let tooltipY = mouseY - tooltipHeight / 2;
    
    if (tooltipX + tooltipWidth > this.width - 20) {
      tooltipX = mouseX - tooltipWidth - 10;
    }
    
    // Keep tooltip on screen vertically
    if (tooltipY < 10) tooltipY = 10;
    if (tooltipY + tooltipHeight > this.height - 10) {
      tooltipY = this.height - tooltipHeight - 10;
    }
    
    // Draw tooltip background
    this.ctx.save();
    this.ctx.fillStyle = 'rgba(50, 50, 50, 0.95)';
    this.ctx.fillRect(tooltipX, tooltipY, tooltipWidth, tooltipHeight);
    
    // Draw border
    this.ctx.strokeStyle = '#666';
    this.ctx.lineWidth = 1;
    this.ctx.strokeRect(tooltipX, tooltipY, tooltipWidth, tooltipHeight);
    
    // Draw title
    this.ctx.fillStyle = '#fff';
    this.ctx.font = 'bold 11px sans-serif';
    this.ctx.textAlign = 'left';
    this.ctx.textBaseline = 'top';
    this.ctx.fillText(bar.node, tooltipX + padding, tooltipY + padding);
    
    // Draw delay components
    let yOffset = tooltipY + padding + lineHeight;
    this.ctx.font = '10px sans-serif';
    
    bar.delays.forEach(delay => {
      // Draw color indicator
      this.ctx.fillStyle = delay.color;
      this.ctx.fillRect(tooltipX + padding, yOffset + 3, 8, 8);
      
      // Draw label and value
      this.ctx.fillStyle = '#ddd';
      const label = delay.type.charAt(0).toUpperCase() + delay.type.slice(1);
      this.ctx.fillText(`${label}:`, tooltipX + padding + 12, yOffset);
      
      this.ctx.fillStyle = '#fff';
      this.ctx.textAlign = 'right';
      this.ctx.fillText(NetworkFormatter.time(delay.value), tooltipX + tooltipWidth - padding, yOffset);
      this.ctx.textAlign = 'left';
      
      yOffset += lineHeight;
    });
    
    // Draw total with separator
    yOffset += 4;
    this.ctx.strokeStyle = '#666';
    this.ctx.beginPath();
    this.ctx.moveTo(tooltipX + padding, yOffset - 2);
    this.ctx.lineTo(tooltipX + tooltipWidth - padding, yOffset - 2);
    this.ctx.stroke();
    
    this.ctx.fillStyle = '#fff';
    this.ctx.font = 'bold 11px sans-serif';
    this.ctx.fillText('Total:', tooltipX + padding, yOffset);
    this.ctx.textAlign = 'right';
    this.ctx.fillText(NetworkFormatter.time(bar.total), tooltipX + tooltipWidth - padding, yOffset);
    
    this.ctx.restore();
  }
  
  /**
   * Draw RTT indicator if applicable
   */
  drawRTTIndicator(rtt, x, y) {
    // Draw RTT arrow and label
    this.ctx.save();
    
    // Arrow
    this.ctx.strokeStyle = COLORS.CHART.INFO;
    this.ctx.lineWidth = 2;
    this.ctx.setLineDash([5, 5]);
    
    this.ctx.beginPath();
    this.ctx.moveTo(x - 30, y);
    this.ctx.lineTo(x + 30, y);
    this.ctx.stroke();
    
    // Arrow heads
    this.ctx.setLineDash([]);
    this.ctx.beginPath();
    this.ctx.moveTo(x - 30, y);
    this.ctx.lineTo(x - 25, y - 5);
    this.ctx.moveTo(x - 30, y);
    this.ctx.lineTo(x - 25, y + 5);
    this.ctx.moveTo(x + 30, y);
    this.ctx.lineTo(x + 25, y - 5);
    this.ctx.moveTo(x + 30, y);
    this.ctx.lineTo(x + 25, y + 5);
    this.ctx.stroke();
    
    // Label
    this.ctx.fillStyle = COLORS.CHART.INFO;
    this.ctx.font = 'bold 11px sans-serif';
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'bottom';
    this.ctx.fillText(`RTT: ${NetworkFormatter.time(rtt)}`, x, y - 10);
    
    this.ctx.restore();
  }
}