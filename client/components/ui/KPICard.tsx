import { LucideIcon } from "lucide-react";

interface KPICardProps {
    title: string;
    value: string;
    icon: LucideIcon;
    colorClass: string;
}

export const KPICard = ({ title, value, icon: Icon, colorClass }: KPICardProps) => (
    <div className="cc-dashboard-kpi">
        <div className="cc-dashboard-kpi-row">
            <div>
                <p className="cc-dashboard-kpi-label">{title}</p>
                <p className={`cc-dashboard-kpi-value ${colorClass}`}>{value}</p>
            </div>
            <Icon className={`cc-dashboard-kpi-icon ${colorClass}`} />
        </div>
    </div>
);