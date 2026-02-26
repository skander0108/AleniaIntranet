-- En-tête de la note de frais
CREATE TABLE expense_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    mission_name VARCHAR(255) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    description TEXT,
    status VARCHAR(50) DEFAULT 'DRAFT', -- DRAFT, SUBMITTED, APPROVED, REJECTED, PAID
    total_amount DECIMAL(10,2) DEFAULT 0.0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Lignes de dépenses liées à l'en-tête
CREATE TABLE expense_lines (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    report_id UUID NOT NULL REFERENCES expense_reports(id) ON DELETE CASCADE,
    category VARCHAR(50) NOT NULL, -- TRANSPORT, HOTEL, MEAL, OTHER
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'EUR',
    expense_date DATE NOT NULL,
    vat_amount DECIMAL(10,2) DEFAULT 0.0,
    comment TEXT,
    receipt_url VARCHAR(500), -- Chemin vers le fichier justifiant (PDF/JPG)
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Suivi des actions (Audit Trail)
CREATE TABLE expense_audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    report_id UUID NOT NULL REFERENCES expense_reports(id) ON DELETE CASCADE,
    action_by UUID NOT NULL REFERENCES users(id),
    action VARCHAR(50) NOT NULL, -- CREATED, SUBMITTED, APPROVED, REJECTED, PAID
    comment TEXT, -- Optionnel, obligatoire si REJECTED
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
