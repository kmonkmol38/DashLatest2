-- Create employees table for storing employee data
CREATE TABLE public.employees (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    employee_id TEXT NOT NULL UNIQUE,
    employee_name TEXT NOT NULL,
    meal_type TEXT,
    company_name TEXT,
    camp_allocation TEXT,
    access_card TEXT,
    card_number TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;

-- Create policy for public read access (employees can be looked up by anyone)
CREATE POLICY "Anyone can view employees" 
ON public.employees 
FOR SELECT 
USING (true);

-- Create policy for authenticated admin to manage employees
CREATE POLICY "Admins can insert employees" 
ON public.employees 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Admins can update employees" 
ON public.employees 
FOR UPDATE 
USING (true);

CREATE POLICY "Admins can delete employees" 
ON public.employees 
FOR DELETE 
USING (true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_employees_updated_at
BEFORE UPDATE ON public.employees
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for employees table
ALTER PUBLICATION supabase_realtime ADD TABLE public.employees;