-- Script para criar alguns agendamentos de exemplo para teste

-- Inserir alguns agendamentos de exemplo para o cliente teste
DO $$
DECLARE
    cliente_id UUID;
    servico_corte_id UUID;
    servico_barba_id UUID;
    servico_completo_id UUID;
BEGIN
    -- Buscar ID do cliente teste
    SELECT id INTO cliente_id FROM profiles WHERE email = 'cliente@teste.com';
    
    -- Buscar IDs dos serviços
    SELECT id INTO servico_corte_id FROM services WHERE name = 'Corte Tradicional' LIMIT 1;
    SELECT id INTO servico_barba_id FROM services WHERE name = 'Barba Completa' LIMIT 1;
    SELECT id INTO servico_completo_id FROM services WHERE name = 'Pacote Completo' LIMIT 1;
    
    -- Verificar se encontrou os dados necessários
    IF cliente_id IS NULL THEN
        RAISE EXCEPTION 'Cliente teste não encontrado';
    END IF;
    
    IF servico_corte_id IS NULL OR servico_barba_id IS NULL OR servico_completo_id IS NULL THEN
        RAISE EXCEPTION 'Serviços não encontrados';
    END IF;
    
    -- Inserir agendamentos de exemplo
    INSERT INTO appointments (user_id, service_id, appointment_date, appointment_time, status, notes) VALUES
    (cliente_id, servico_corte_id, CURRENT_DATE + INTERVAL '1 day', '10:00', 'scheduled', 'Primeiro agendamento de teste'),
    (cliente_id, servico_barba_id, CURRENT_DATE + INTERVAL '3 days', '14:30', 'scheduled', 'Apenas aparar a barba'),
    (cliente_id, servico_completo_id, CURRENT_DATE - INTERVAL '7 days', '16:00', 'completed', 'Serviço completo realizado'),
    (cliente_id, servico_corte_id, CURRENT_DATE - INTERVAL '14 days', '11:00', 'completed', 'Corte anterior'),
    (cliente_id, servico_barba_id, CURRENT_DATE - INTERVAL '2 days', '15:00', 'cancelled', 'Cliente cancelou')
    ON CONFLICT DO NOTHING;
    
    RAISE NOTICE 'Agendamentos de exemplo criados com sucesso!';
END $$;
