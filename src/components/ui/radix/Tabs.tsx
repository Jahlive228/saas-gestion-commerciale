"use client";

import React from "react";
import * as TabsPrimitive from "@radix-ui/react-tabs";

interface TabsProps {
  defaultValue?: string;
  value?: string;
  onValueChange?: (value: string) => void;
  children: React.ReactNode;
  className?: string;
}

interface TabsListProps {
  children: React.ReactNode;
  className?: string;
}

interface TabsTriggerProps {
  value: string;
  children: React.ReactNode;
  disabled?: boolean;
  className?: string;
}

interface TabsContentProps {
  value: string;
  children: React.ReactNode;
  className?: string;
}

const Tabs = ({ children, className = "", ...props }: TabsProps) => (
  <TabsPrimitive.Root className={`w-full ${className}`} {...props}>
    {children}
  </TabsPrimitive.Root>
);

const TabsList = ({ children, className = "" }: TabsListProps) => (
  <TabsPrimitive.List className={`inline-flex h-10 items-center justify-center rounded-lg bg-gray-100 p-1 text-gray-500 dark:bg-gray-800 dark:text-gray-400 ${className}`}>
    {children}
  </TabsPrimitive.List>
);

const TabsTrigger = ({ children, className = "", ...props }: TabsTriggerProps) => (
  <TabsPrimitive.Trigger
    className={`
      inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium
      ring-offset-white transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2
      disabled:pointer-events-none disabled:opacity-50
      data-[state=active]:bg-white data-[state=active]:text-gray-950 data-[state=active]:shadow-sm
      dark:ring-offset-gray-950 dark:focus-visible:ring-gray-300
      dark:data-[state=active]:bg-gray-950 dark:data-[state=active]:text-gray-50
      hover:bg-gray-50 dark:hover:bg-gray-700
      ${className}
    `}
    {...props}
  >
    {children}
  </TabsPrimitive.Trigger>
);

const TabsContent = ({ children, className = "", ...props }: TabsContentProps) => (
  <TabsPrimitive.Content
    className={`mt-2 ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 dark:ring-offset-gray-950 dark:focus-visible:ring-gray-300 ${className}`}
    {...props}
  >
    {children}
  </TabsPrimitive.Content>
);

Tabs.List = TabsList;
Tabs.Trigger = TabsTrigger;
Tabs.Content = TabsContent;

export default Tabs;
export { TabsList, TabsTrigger, TabsContent };