-- Script para criar usuários de teste (pular verificação de email)

-- Inserir usuário comum de teste
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  recovery_sent_at,
  last_sign_in_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'cliente@teste.com',
  crypt('123456', gen_salt('bf')), -- senha: 123456
  NOW(),
  NOW(),
  NOW(),
  '{"provider": "email", "providers": ["email"]}',
  '{"full_name": "Cliente Teste", "phone": "(11) 99999-1111"}',
  NOW(),
  NOW(),
  '',
  '',
  '',
  ''
) ON CONFLICT (email) DO NOTHING;

-- Inserir administrador de teste
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  recovery_sent_at,
  last_sign_in_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'admin@barbeariatop.com',
  crypt('admin123', gen_salt('bf')), -- senha: admin123
  NOW(),
  NOW(),
  NOW(),
  '{"provider": "email", "providers": ["email"]}',
  '{"full_name": "Administrador", "phone": "(11) 99999-0000"}',
  NOW(),
  NOW(),
  '',
  '',
  '',
  ''
) ON CONFLICT (email) DO NOTHING;

-- Aguardar um momento para os triggers executarem
SELECT pg_sleep(1);

-- Verificar se os perfis foram criados automaticamente pelo trigger
-- Se não foram, criar manualmente

-- Buscar os IDs dos usuários criados
DO $$
DECLARE
    cliente_id UUID;
    admin_id UUID;
BEGIN
    -- Buscar ID do cliente
    SELECT id INTO cliente_id FROM auth.users WHERE email = 'cliente@teste.com';
    
    -- Buscar ID do admin
    SELECT id INTO admin_id FROM auth.users WHERE email = 'admin@barbeariatop.com';
    
    -- Inserir perfil do cliente se não existir
    INSERT INTO profiles (id, email, full_name, phone, is_admin)
    VALUES (cliente_id, 'cliente@teste.com', 'Cliente Teste', '(11) 99999-1111', FALSE)
    ON CONFLICT (id) DO UPDATE SET
        full_name = EXCLUDED.full_name,
        phone = EXCLUDED.phone,
        is_admin = EXCLUDED.is_admin;
    
    -- Inserir perfil do admin se não existir
    INSERT INTO profiles (id, email, full_name, phone, is_admin)
    VALUES (admin_id, 'admin@barbeariatop.com', 'Administrador', '(11) 99999-0000', TRUE)
    ON CONFLICT (id) DO UPDATE SET
        full_name = EXCLUDED.full_name,
        phone = EXCLUDED.phone,
        is_admin = EXCLUDED.is_admin;
        
    RAISE NOTICE 'Usuários de teste criados com sucesso!';
    RAISE NOTICE 'Cliente: cliente@teste.com / senha: 123456';
    RAISE NOTICE 'Admin: admin@barbeariatop.com / senha: admin123';
END $$;
