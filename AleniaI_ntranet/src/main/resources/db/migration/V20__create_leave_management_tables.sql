-- Create leave_types table
CREATE TABLE leave_types (
    id UUID PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    requires_approval BOOLEAN NOT NULL DEFAULT TRUE,
    deducts_balance BOOLEAN NOT NULL DEFAULT TRUE,
    allowance_per_year DOUBLE PRECISION,
    color_code VARCHAR(7),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create leave_balances table
CREATE TABLE leave_balances (
    id UUID PRIMARY KEY,
    employee_id UUID NOT NULL REFERENCES users(id),
    leave_type_id UUID NOT NULL REFERENCES leave_types(id),
    total_allowance DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    days_taken DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    year INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    UNIQUE(employee_id, leave_type_id, year)
);

-- Create leave_requests table
CREATE TABLE leave_requests (
    id UUID PRIMARY KEY,
    employee_id UUID NOT NULL REFERENCES users(id),
    leave_type_id UUID NOT NULL REFERENCES leave_types(id),
    start_date DATE NOT NULL,
    start_period VARCHAR(2) NOT NULL,
    end_date DATE NOT NULL,
    end_period VARCHAR(2) NOT NULL,
    duration DOUBLE PRECISION NOT NULL,
    status VARCHAR(50) NOT NULL,
    reason TEXT,
    manager_comment TEXT,
    attachment_url VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create public_holidays table
CREATE TABLE public_holidays (
    id UUID PRIMARY KEY,
    date DATE NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL
);

-- Insert default leave types
INSERT INTO leave_types (id, name, requires_approval, deducts_balance, allowance_per_year, color_code)
VALUES
    (gen_random_uuid(), 'Paid Leave', true, true, 25.0, '#4F46E5'), -- Indigo
    (gen_random_uuid(), 'Sick Leave', false, false, 0.0, '#EF4444'), -- Red
    (gen_random_uuid(), 'RTT', true, true, 10.0, '#10B981'), -- Emerald
    (gen_random_uuid(), 'Unpaid Leave', true, false, 0.0, '#6B7280'), -- Gray
    (gen_random_uuid(), 'Remote Work', true, false, 0.0, '#3B82F6'); -- Blue
