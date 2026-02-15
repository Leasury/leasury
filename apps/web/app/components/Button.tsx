import Link from 'next/link';

interface ButtonProps {
    children: React.ReactNode;
    href?: string;
    onClick?: () => void;
    variant?: 'primary' | 'secondary' | 'outline';
    className?: string;
}

export default function Button({
    children,
    href,
    onClick,
    variant = 'primary',
    className = '',
}: ButtonProps) {
    const baseStyles =
        'inline-flex items-center justify-center px-6 py-3 rounded-lg font-semibold transition-all duration-200 hover:scale-105';

    const variantStyles = {
        primary: 'bg-[#141413] text-white hover:bg-[#2a2a28]',
        secondary: 'bg-[#FAF9F5] text-[#141413] hover:bg-[#F0EFEA] border border-[#E8E6DC]',
        outline: 'border-2 border-[#141413] text-[#141413] hover:bg-[#F0EFEA]',
    };

    const combinedClassName = `${baseStyles} ${variantStyles[variant]} ${className}`;

    if (href) {
        return (
            <Link href={href} className={combinedClassName}>
                {children}
            </Link>
        );
    }

    return (
        <button onClick={onClick} className={combinedClassName}>
            {children}
        </button>
    );
}
