import type { ImgHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export default function AppLogoIcon({
    className,
    alt = 'Javan logo',
    ...props
}: ImgHTMLAttributes<HTMLImageElement>) {
    return (
        <img
            src="/assets/javan.webp"
            alt={alt}
            className={cn('block object-contain', className)}
            {...props}
        />
    );
}
