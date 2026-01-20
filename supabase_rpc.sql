-- Create RPC Function to handle atomic registration
-- Execute this in your Supabase SQL Editor

CREATE OR REPLACE FUNCTION register_athlete(
  p_registration_id TEXT,
  p_full_name TEXT,     
  p_document_id TEXT,
  p_age INTEGER,
  p_phone TEXT,
  p_email TEXT,
  p_category TEXT,
  p_gender TEXT,
  p_gym TEXT,
  p_shirt_size TEXT,
  p_emergency_name TEXT,
  p_emergency_phone TEXT,
  p_payment_method TEXT,
  p_payment_proof_path TEXT
) RETURNS JSON AS $$
DECLARE
  current_count INTEGER;
  dup_count INTEGER;
  max_slots INTEGER := 32;
  result JSON;
BEGIN
  -- Lock para evitar race condition
  LOCK TABLE registrations IN EXCLUSIVE MODE;
  
  -- 1. Anti-Duplicate Check (Backend Enforcement)
  SELECT COUNT(*) INTO dup_count 
  FROM registrations 
  WHERE document_id = p_document_id;

  IF dup_count > 0 THEN
    result := json_build_object(
      'success', false,
      'error', 'Este documento ya está registrado'
    );
    RETURN result;
  END IF;
  
  -- 2. Contar registros actuales (Excluyendo RECHAZADOS para liberar cupo)
  SELECT COUNT(*) INTO current_count
  FROM registrations
  WHERE category = p_category 
  AND gender = p_gender
  AND status != 'REJECTED';
  
  -- Validar cupo disponible
  IF current_count >= max_slots THEN
    result := json_build_object(
      'success', false,
      'error', 'Cupo agotado para esta categoría'
    );
    RETURN result;
  END IF;
  
  -- Insertar registro
  INSERT INTO registrations (
    registration_id, full_name, document_id, age, phone, email,
    category, gender, gym, shirt_size, emergency_name, emergency_phone,
    payment_method, payment_proof_path, status
  ) VALUES (
    p_registration_id, p_full_name, p_document_id, p_age, p_phone, p_email,
    p_category, p_gender, p_gym, p_shirt_size, p_emergency_name, p_emergency_phone,
    p_payment_method, p_payment_proof_path, 'PENDING_VALIDATION'
  );
  
  result := json_build_object('success', true);
  RETURN result;
END;
$$ LANGUAGE plpgsql;
