import { forwardRef } from "react";
import { cn } from "@/lib/utils";

const Card = forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
    <div
        ref={ref}
        className={cn(
            "glass rounded-xl border border-slate-200 shadow-cyber overflow-hidden",
            className
        )}
        {...props}
    />
))
Card.displayName = "Card"

const CardHeader = forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
    <div
        ref={ref}
        className={cn("flex flex-col space-y-1.5 p-6 border-b border-slate-100 bg-slate-50/50", className)}
        {...props}
    />
))
CardHeader.displayName = "CardHeader"

const CardTitle = forwardRef<
    HTMLParagraphElement,
    React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
    <h3
        ref={ref}
        className={cn(
            "text-lg font-black leading-none tracking-tight text-glow text-foreground uppercase",
            className
        )}
        {...props}
    />
))
CardTitle.displayName = "CardTitle"

const CardDescription = forwardRef<
    HTMLParagraphElement,
    React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
    <p
        ref={ref}
        className={cn("text-xs text-slate-400 font-medium tracking-wide", className)}
        {...props}
    />
))
CardDescription.displayName = "CardDescription"

const CardContent = forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
    <div ref={ref} className={cn("p-6 pt-0 mt-6", className)} {...props} />
))
CardContent.displayName = "CardContent"

const CardFooter = forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
    <div
        ref={ref}
        className={cn("flex items-center p-6 pt-0 border-t border-white/5 mt-auto", className)}
        {...props}
    />
))
CardFooter.displayName = "CardFooter"

export { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter };
