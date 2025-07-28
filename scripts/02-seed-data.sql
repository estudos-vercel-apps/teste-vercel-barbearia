-- Inserir serviços padrão
INSERT INTO services (name, description, duration, price) VALUES
('Corte Tradicional', 'Corte clássico com tesoura e máquina', 30, 25.00),
('Corte + Barba', 'Corte completo com aparação de barba', 45, 35.00),
('Barba Completa', 'Aparação e modelagem de barba', 20, 15.00),
('Corte Degradê', 'Corte moderno com degradê', 40, 30.00),
('Sobrancelha', 'Aparação e modelagem de sobrancelha', 15, 10.00),
('Pacote Completo', 'Corte + Barba + Sobrancelha', 60, 45.00)
ON CONFLICT DO NOTHING;
