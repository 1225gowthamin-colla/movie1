document.addEventListener('DOMContentLoaded', async () => {
    // 1. Check Auth
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user || !localStorage.getItem('token')) {
        window.location.href = '/login.html';
        return;
    }

    // Update UI with user info
    document.getElementById('user-name').textContent = user.name;
    document.getElementById('user-role').textContent = user.role.charAt(0).toUpperCase() + user.role.slice(1);
    document.getElementById('welcome-message').textContent = `Welcome back, ${user.name.split(' ')[0]}`;

    // Show/Hide features based on role
    if (user.role === 'student') {
        document.getElementById('nav-students').style.display = 'none';
        document.getElementById('stats-container').style.display = 'none';
    }

    // Logout logic
    document.getElementById('logoutBtn').addEventListener('click', (e) => {
        e.preventDefault();
        localStorage.clear();
        window.location.href = '/login.html';
    });

    // 2. Load Dashboard Data
    try {
        if (user.role !== 'student') {
            const stats = await api.getOverview();
            document.getElementById('stat-total-students').textContent = stats.data.totalStudents;
            document.getElementById('stat-avg-attendance').textContent = `${stats.data.avgAttendance}%`;
            document.getElementById('stat-at-risk').textContent = stats.data.atRiskStudents;
        }

        const trends = await api.getTrends();
        initTrendsChart(trends.data);

        const logs = await api.getAttendanceHistory();
        renderLogsTable(logs.data);

        const ai = await api.getAIInsights();
        renderAIInsights(ai.data);

    } catch (error) {
        ui.showToast('Failed to load dashboard data', 'error');
    }

    // 3. Socket.io Integration
    const socket = io();
    socket.on('attendanceUpdate', (data) => {
        ui.showToast(`${data.studentName} marked attendance: ${data.status}`, 'success');
        // Refresh logs table
        api.getAttendanceHistory().then(res => renderLogsTable(res.data));
    });

    socket.on(`notification_${user._id}`, (notification) => {
        ui.showToast(notification.title, notification.type);
    });
});

function initTrendsChart(data) {
    const ctx = document.getElementById('trendsChart').getContext('2d');
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: data.map(d => d.date),
            datasets: [{
                label: 'Present Students',
                data: data.map(d => d.count),
                borderColor: '#4f46e5',
                tension: 0.4,
                fill: true,
                backgroundColor: 'rgba(79, 70, 229, 0.1)'
            }]
        },
        options: {
            responsive: true,
            plugins: { legend: { display: false } },
            scales: {
                y: { beginAtZero: true, grid: { display: false } },
                x: { grid: { display: false } }
            }
        }
    });
}

function renderLogsTable(logs) {
    const tbody = document.querySelector('#logsTable tbody');
    tbody.innerHTML = logs.slice(0, 10).map(log => `
        <tr>
            <td>
                <div style="font-weight: 600;">${log.student?.user?.name || 'Unknown'}</div>
                <div class="text-muted" style="font-size: 0.75rem;">${log.student?.studentId || '-'}</div>
            </td>
            <td>${new Date(log.timestamp).toLocaleString()}</td>
            <td>${log.distanceFromCenter}m</td>
            <td><span class="badge badge-success">${log.status}</span></td>
        </tr>
    `).join('');
}

function renderAIInsights(insights) {
    const container = document.getElementById('ai-insights-list');
    container.innerHTML = insights.slice(0, 3).map(i => `
        <div class="card" style="margin-bottom: 0; padding: 1rem; border-left: 4px solid ${i.riskLevel === 'High' ? '#ef4444' : '#f59e0b'};">
            <h4 style="font-size: 0.875rem;">${i.name}</h4>
            <p style="font-size: 0.75rem; margin: 4px 0;">${i.prediction}</p>
            <p style="font-size: 0.7rem; color: var(--text-muted);">${i.recommendation}</p>
        </div>
    `).join('');
}
