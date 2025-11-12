import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Card } from 'primereact/card';
import { FaUsers, FaUser, FaClock, FaArrowUp, FaArrowDown } from 'react-icons/fa';
const Dashboard = () => {
    // Static data for dashboard cards with icon components
    const dashboardStats = [
        {
            id: 1,
            title: 'Active Clients',
            value: 46,
            icon: _jsx(FaUsers, {}),
            color: '#3b82f6',
            bgColor: '#eff6ff',
            trend: '+12%',
            trendColor: '#10b981',
            description: 'Total active clients'
        },
        {
            id: 2,
            title: 'Available Candidates',
            value: 100,
            icon: _jsx(FaUser, {}),
            color: '#10b981',
            bgColor: '#f0fdf4',
            trend: '+8%',
            trendColor: '#10b981',
            description: 'Ready for placement'
        },
        {
            id: 3,
            title: 'Pending Reviews',
            value: 7,
            icon: _jsx(FaClock, {}),
            color: '#ef4444',
            bgColor: '#fef2f2',
            trend: '-2%',
            trendColor: '#ef4444',
            description: 'Awaiting review'
        }
    ];
    const cardTemplate = (stat) => (_jsxs("div", { style: {
            padding: '1.5rem',
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
            minHeight: '180px'
        }, children: [_jsxs("div", { style: {
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    marginBottom: '1rem'
                }, children: [_jsx("div", { children: _jsx("h3", { style: {
                                margin: 0,
                                fontSize: '0.875rem',
                                fontWeight: '500',
                                color: '#6b7280',
                                textTransform: 'uppercase',
                                letterSpacing: '0.05em'
                            }, children: stat.title }) }), _jsx("div", { style: {
                            width: '3rem',
                            height: '3rem',
                            borderRadius: '0.75rem',
                            backgroundColor: stat.bgColor,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: stat.color,
                            fontSize: '1.25rem'
                        }, children: stat.icon })] }), _jsxs("div", { style: {
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center'
                }, children: [_jsx("div", { style: {
                            fontSize: '2.5rem',
                            fontWeight: '700',
                            color: '#111827',
                            lineHeight: '1',
                            marginBottom: '0.5rem'
                        }, children: stat.value.toLocaleString() }), _jsx("div", { style: {
                            fontSize: '0.875rem',
                            color: '#6b7280',
                            marginBottom: '0.75rem'
                        }, children: stat.description })] }), _jsxs("div", { style: {
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    color: stat.trendColor
                }, children: [stat.trend.startsWith('+') ? _jsx(FaArrowUp, {}) : _jsx(FaArrowDown, {}), _jsxs("span", { children: [stat.trend, " from last month"] })] })] }));
    return (_jsxs("div", { className: "p-4", children: [_jsx("div", { className: "mb-4", children: _jsx("h1", { style: {
                        fontSize: '2rem',
                        fontWeight: '600',
                        color: '#111827',
                        margin: 0,
                        marginBottom: '0.5rem'
                    }, children: "Welcome to the Aerolens Portal" }) }), _jsx("div", { style: {
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                    gap: '1.5rem',
                    marginBottom: '2rem'
                }, children: dashboardStats.map((stat) => (_jsx(Card, { className: "shadow-2", style: {
                        border: '1px solid #e5e7eb',
                        borderRadius: '0.75rem',
                        overflow: 'hidden',
                        transition: 'all 0.2s ease',
                        cursor: 'default'
                    }, onMouseEnter: (e) => {
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.boxShadow = '0 10px 25px rgba(0,0,0,0.1)';
                    }, onMouseLeave: (e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)';
                    }, children: cardTemplate(stat) }, stat.id))) })] }));
};
export default Dashboard;
