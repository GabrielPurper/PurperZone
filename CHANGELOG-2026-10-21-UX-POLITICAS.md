# Atualização de UX e políticas — 21/10/2026

- Corrigido o fluxo de cancelamento do envio de Reel: limpar seleção/preview, revogar URL temporária e permitir fechar o diálogo sem publicar.
- Comentários mostram avatar textual, horário, feedback de lista vazia, limite de caracteres e atalhos para perfil/conversa.
- Adicionadas páginas iniciais de Termos de Uso, Política de Privacidade e Controle Parental.
- Adicionada documentação de instalação móvel (PWA/Capacitor) e isolamento seguro de miniaplicativos.

## Pendências que exigem configuração real
- Termos e privacidade são modelos; completar os dados do operador e revisar com profissional jurídico.
- Controle parental nesta entrega salva preferências no navegador, não aplica restrições server-side nem sincroniza entre dispositivos.
- União de contas Google/GitHub por e-mail deve exigir confirmação/autenticação das duas contas; nunca vincular automaticamente só porque os e-mails coincidem.
- Persistência real depende das tabelas, Storage e políticas RLS do projeto Supabase, além de testes de ponta a ponta.
