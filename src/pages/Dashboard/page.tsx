import React from 'react';
import { Card } from 'primereact/card';
import { FaUsers, FaUser, FaClock, FaArrowUp, FaArrowDown } from 'react-icons/fa';

interface DashboardStat {
    id: number;
    title: string;
    value: number;
    icon: JSX.Element;
    color: string;
    bgColor: string;
    trend: string;
    trendColor: string;
    description: string;
}

const Dashboard: React.FC = () => {
    // Static data for dashboard cards with icon components
    const dashboardStats: DashboardStat[] = [
        {
            id: 1,
            title: 'Active Clients',
            value: 46,
            icon: <FaUsers />,
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
            icon: <FaUser />,
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
            icon: <FaClock />,
            color: '#ef4444',
            bgColor: '#fef2f2',
            trend: '-2%',
            trendColor: '#ef4444',
            description: 'Awaiting review'
        }
    ];

    const cardTemplate = (stat: DashboardStat) => (
        <div
            style={{
                padding: '1.5rem',
                display: 'flex',
                flexDirection: 'column',
                height: '100%',
                minHeight: '180px'
            }}
        >
            {/* Header with icon */}
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                marginBottom: '1rem'
            }}>
                <div>
                    <h3 style={{
                        margin: 0,
                        fontSize: '0.875rem',
                        fontWeight: '500',
                        color: '#374151',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em'
                    }}>
                        {stat.title}
                    </h3>
                </div>
                <div
                    style={{
                        width: '3rem',
                        height: '3rem',
                        borderRadius: '0.75rem',
                        backgroundColor: stat.bgColor,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: stat.color,
                        fontSize: '1.25rem'
                    }}
                >
                    {stat.icon}
                </div>
            </div>

            {/* Main value */}
            <div style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center'
            }}>
                <div style={{
                    fontSize: '2.5rem',
                    fontWeight: '700',
                    color: '#111827',
                    lineHeight: '1',
                    marginBottom: '0.5rem'
                }}>
                    {stat.value.toLocaleString()}
                </div>

                <div style={{
                    fontSize: '0.875rem',
                    color: '#374151',
                    marginBottom: '0.75rem'
                }}>
                    {stat.description}
                </div>
            </div>

            {/* Trend indicator */}
            <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontSize: '0.875rem',
                fontWeight: '500',
                color: stat.trendColor
            }}>
                {stat.trend.startsWith('+') ? <FaArrowUp /> : <FaArrowDown />}
                <span>{stat.trend} from last month</span>
            </div>
        </div>
    );

    return (
        <div className="p-4">
            {/* Header Section */}
            <div className="mb-4">
                <h1 style={{
                    fontSize: '2rem',
                    fontWeight: '600',
                    color: '#111827',
                    margin: 0,
                    marginBottom: '0.5rem'
                }}>
                    Welcome to the Aerolens Portal
                </h1>
            </div>

            {/* Statistics Cards Grid */}
            <div
                style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                    gap: '1.5rem',
                    marginBottom: '2rem'
                }}
            >
                {dashboardStats.map((stat) => (
                    <Card
                        key={stat.id}
                        className="shadow-2"
                        style={{
                            border: '1px solid #e5e7eb',
                            borderRadius: '0.75rem',
                            overflow: 'hidden',
                            transition: 'all 0.2s ease',
                            cursor: 'default'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translateY(-2px)';
                            e.currentTarget.style.boxShadow = '0 10px 25px rgba(0,0,0,0.1)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)';
                        }}
                    >
                        {cardTemplate(stat)}
                    </Card>
                ))}
            </div>
        </div>
    );
};

export default Dashboard;
