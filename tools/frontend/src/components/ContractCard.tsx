import { formatAddress } from "../lib/contracts";

interface ContractCardProps {
    title: string;
    address: string;
    description?: string;
}

const ContractCard = ({ title, address, description }: ContractCardProps) => (
    <div className="card">
        <h3>{title}</h3>
        <p className="small">{formatAddress(address)}</p>
        {description && <p>{description}</p>}
    </div>
);

export default ContractCard;
