import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { Controller, FormProvider, useFormContext } from 'react-hook-form';
import { cn } from '@/lib/utils';

const Form = FormProvider;

const FormField = ({
    control,
    name,
    render
}: {
    control: any;
    name: string;
    render: ({ field, fieldState }: { field: any; fieldState: any }) => React.ReactElement;
}) => {
    return (
        <Controller
            control={control}
            name={name}
            render={({ field, fieldState }) => render({ field, fieldState })}
        />
    );
};

const FormItem = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
    ({ className, ...props }, ref) => <div ref={ref} className={cn('space-y-1.5', className)} {...props} />
);
FormItem.displayName = 'FormItem';

const FormLabel = React.forwardRef<
    React.ElementRef<typeof Slot>,
    React.ComponentPropsWithoutRef<typeof Slot>
>(({ className, ...props }, ref) => (
    <Slot ref={ref} className={cn('text-sm font-medium leading-none', className)} {...props} />
));
FormLabel.displayName = 'FormLabel';

const FormControl = React.forwardRef<
    React.ElementRef<typeof Slot>,
    React.ComponentPropsWithoutRef<typeof Slot>
>(({ className, ...props }, ref) => (
    <Slot ref={ref} className={cn('grid gap-1', className)} {...props} />
));
FormControl.displayName = 'FormControl';

const FormDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
    ({ className, ...props }, ref) => (
        <p ref={ref} className={cn('text-sm text-muted-foreground', className)} {...props} />
    )
);
FormDescription.displayName = 'FormDescription';

const FormMessage = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
    ({ className, children, ...props }, ref) => {
        const body = typeof children === 'string' ? children : null;
        return body ? (
            <p ref={ref} className={cn('text-sm font-medium text-destructive', className)} {...props}>
                {body}
            </p>
        ) : null;
    }
);
FormMessage.displayName = 'FormMessage';

export { Form, FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage };
