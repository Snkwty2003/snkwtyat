// Charts and graphs management functionality

// Create a simple bar chart
function createBarChart(containerId, data, options = {}) {
    const {
        height = 300,
        barColor = "#E33E10",
        showLabels = true,
        showValues = true,
        animate = true
    } = options;

    const container = document.getElementById(containerId);
    if (!container) return;

    const maxValue = Math.max(...data.map(item => item.value));
    const chartHeight = height - 40; // Leave space for labels

    let html = "<div class=\"bar-chart\" style=\"height: " + height + "px;\">";

    data.forEach((item, index) => {
        const barHeight = (item.value / maxValue) * chartHeight;
        const animationStyle = animate ? `animation: growBar 0.5s ease-out ${index * 0.1}s forwards;` : "";

        html += `
            <div class="bar-group">
                <div class="bar" style="
                    height: ${barHeight}px;
                    background: ${barColor};
                    ${animationStyle}
                ">
                    ${showValues ? `<span class="bar-value">${item.value}</span>` : ""}
                </div>
                ${showLabels ? `<span class="bar-label">${item.label}</span>` : ""}
            </div>
        `;
    });

    html += "</div>";

    container.innerHTML = html;

    // Add animation styles if not already present
    if (animate && !document.getElementById("bar-chart-styles")) {
        const style = document.createElement("style");
        style.id = "bar-chart-styles";
        style.textContent = `
            @keyframes growBar {
                from { height: 0; }
            }
            .bar-chart {
                display: flex;
                align-items: flex-end;
                justify-content: space-around;
                gap: 10px;
            }
            .bar-group {
                display: flex;
                flex-direction: column;
                align-items: center;
                flex: 1;
            }
            .bar {
                width: 100%;
                min-width: 30px;
                max-width: 60px;
                border-radius: 4px 4px 0 0;
                position: relative;
                display: flex;
                align-items: flex-start;
                justify-content: center;
                padding-top: 5px;
            }
            .bar-value {
                color: white;
                font-size: 12px;
                font-weight: bold;
            }
            .bar-label {
                margin-top: 5px;
                font-size: 12px;
                color: #666;
                text-align: center;
            }
        `;
        document.head.appendChild(style);
    }
}

// Create a simple line chart
function createLineChart(containerId, data, options = {}) {
    const {
        height = 300,
        lineColor = "#E33E10",
        pointColor = "#ff6b4a",
        showLabels = true,
        showPoints = true,
        fillArea = false
    } = options;

    const container = document.getElementById(containerId);
    if (!container) return;

    const maxValue = Math.max(...data.map(item => item.value));
    const minValue = Math.min(...data.map(item => item.value));
    const range = maxValue - minValue || 1;

    const padding = 40;
    const chartWidth = container.clientWidth - (padding * 2);
    const chartHeight = height - (padding * 2);

    const points = data.map((item, index) => {
        const x = (index / (data.length - 1)) * chartWidth;
        const y = chartHeight - ((item.value - minValue) / range) * chartHeight;
        return { x, y, value: item.value, label: item.label };
    });

    // Create SVG path
    let pathD = `M ${points[0].x} ${points[0].y}`;
    points.slice(1).forEach(point => {
        pathD += ` L ${point.x} ${point.y}`;
    });

    // Create area path if fillArea is true
    let areaPathD = "";
    if (fillArea) {
        areaPathD = `${pathD} L ${points[points.length-1].x} ${chartHeight} L ${points[0].x} ${chartHeight} Z`;
    }

    let html = `
        <svg width="${container.clientWidth}" height="${height}" class="line-chart">
            <defs>
                <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" style="stop-color:${lineColor};stop-opacity:0.3" />
                    <stop offset="100%" style="stop-color:${lineColor};stop-opacity:0" />
                </linearGradient>
            </defs>
            <g transform="translate(${padding}, ${padding})">
                ${fillArea ? `<path d="${areaPathD}" fill="url(#areaGradient)" />` : ""}
                <path d="${pathD}" fill="none" stroke="${lineColor}" stroke-width="2" />
                ${showPoints ? points.map(point => `
                    <circle cx="${point.x}" cy="${point.y}" r="4" fill="${pointColor}" />
                    <text x="${point.x}" y="${point.y - 10}" text-anchor="middle" font-size="12" fill="#666">
                        ${point.value}
                    </text>
                `).join("") : ""}
                ${showLabels ? points.map(point => `
                    <text x="${point.x}" y="${chartHeight + 20}" text-anchor="middle" font-size="12" fill="#666">
                        ${point.label}
                    </text>
                `).join("") : ""}
            </g>
        </svg>
    `;

    container.innerHTML = html;
}

// Create a simple pie chart
function createPieChart(containerId, data, options = {}) {
    const {
        size = 300,
        showLabels = true,
        showLegend = true
    } = options;

    const container = document.getElementById(containerId);
    if (!container) return;

    const total = data.reduce((sum, item) => sum + item.value, 0);
    let currentAngle = 0;

    const colors = ["#E33E10", "#ff6b4a", "#388e3c", "#1976d2", "#f57c00", "#7b1fa2"];

    let slices = data.map((item, index) => {
        const sliceAngle = (item.value / total) * 360;
        const startAngle = currentAngle;
        const endAngle = currentAngle + sliceAngle;

        const x1 = Math.cos(Math.PI * startAngle / 180) * size / 2;
        const y1 = Math.sin(Math.PI * startAngle / 180) * size / 2;
        const x2 = Math.cos(Math.PI * endAngle / 180) * size / 2;
        const y2 = Math.sin(Math.PI * endAngle / 180) * size / 2;

        const largeArcFlag = sliceAngle > 180 ? 1 : 0;

        const pathData = [
            "M 0 0",
            `L ${x1} ${y1}`,
            `A ${size/2} ${size/2} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
            "Z"
        ].join(" ");

        currentAngle += sliceAngle;

        return {
            path: pathData,
            color: colors[index % colors.length],
            label: item.label,
            value: item.value,
            percentage: ((item.value / total) * 100).toFixed(1)
        };
    });

    let html = `
        <div class="pie-chart-container" style="display: flex; align-items: center; justify-content: center;">
            <svg width="${size}" height="${size}" viewBox="${-size/2} ${-size/2} ${size} ${size}" class="pie-chart">
                ${slices.map(slice => `
                    <path d="${slice.path}" fill="${slice.color}" stroke="white" stroke-width="2" />
                `).join("")}
            </svg>
            ${showLegend ? `
                <div class="pie-legend" style="margin-right: 20px;">
                    ${slices.map(slice => `
                        <div class="legend-item" style="display: flex; align-items: center; margin-bottom: 8px;">
                            <div class="legend-color" style="
                                width: 16px;
                                height: 16px;
                                background: ${slice.color};
                                border-radius: 3px;
                                margin-left: 8px;
                            "></div>
                            <div class="legend-label" style="font-size: 14px; color: #666;">
                                ${slice.label} (${slice.percentage}%)
                            </div>
                        </div>
                    `).join("")}
                </div>
            ` : ""}
        </div>
    `;

    container.innerHTML = html;
}

// Export functions for use in other files
window.adminCharts = {
    createBarChart,
    createLineChart,
    createPieChart
};
