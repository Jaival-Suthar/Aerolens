import React from 'react';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';

const Dashboard = () => {
    return (
        <div className="p-2">
            <Card title="Welcome to the Dashboard" className="mb-3">
                <p className="m-0">This is your main dashboard where you can get an overview of your application.</p>
                <Button label="Get Started" className="mt-3" onClick={() => alert('Getting Started!')} />
            </Card>
            </div>
    );
}

export default Dashboard;
  