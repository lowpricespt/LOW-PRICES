import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Política de Privacidade',
};

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="font-display text-3xl font-semibold tracking-tight">Política de Privacidade</h1>
      <p className="mt-2 text-sm text-muted-foreground">Última atualização: [preencher na publicação]</p>

      <div className="mt-8 rounded-lg border border-border bg-secondary p-4 text-sm text-muted-foreground">
        <strong className="text-foreground">Nota importante:</strong> este documento cobre os elementos
        exigidos pelo RGPD (Regulamento (UE) 2016/679) e pela Lei n.º 58/2019.{' '}
        <strong className="text-foreground">Não substitui aconselhamento jurídico</strong> — deve ser revisto
        por um advogado ou DPO antes do lançamento, e os campos entre parênteses retos preenchidos com os
        dados reais da empresa.
      </div>

      <div className="mt-8 max-w-none space-y-6 text-sm leading-relaxed text-foreground [&_a]:text-primary [&_a]:underline [&_h2]:mt-8 [&_h2]:font-display [&_h2]:text-xl [&_h2]:font-semibold [&_li]:ml-5 [&_li]:list-disc [&_p]:text-muted-foreground [&_td]:border [&_td]:border-border [&_td]:px-3 [&_td]:py-2 [&_th]:border [&_th]:border-border [&_th]:bg-secondary [&_th]:px-3 [&_th]:py-2 [&_th]:text-left [&_table]:w-full [&_table]:border-collapse [&_ul]:space-y-1">
        <h2>1. Responsável pelo tratamento</h2>
        <p>
          [Nome da empresa], NIF [NIF], com sede em [morada], é responsável pelo tratamento dos dados
          pessoais recolhidos através da Low Prices. Contacto para questões de privacidade: [email de
          privacidade/DPO].
        </p>

        <h2>2. Que dados recolhemos</h2>
        <table>
          <thead>
            <tr>
              <th>Categoria</th>
              <th>Exemplos</th>
              <th>De quem</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Identificação e contacto</td>
              <td>Nome, email, telefone</td>
              <td>Clientes e Profissionais</td>
            </tr>
            <tr>
              <td>Localização</td>
              <td>Morada, código postal, coordenadas aproximadas</td>
              <td>Clientes e Profissionais</td>
            </tr>
            <tr>
              <td>Verificação de identidade</td>
              <td>Documento de identificação, comprovativo de atividade</td>
              <td>Profissionais</td>
            </tr>
            <tr>
              <td>Conteúdo gerado</td>
              <td>Descrições de pedidos, mensagens, avaliações, fotografias</td>
              <td>Clientes e Profissionais</td>
            </tr>
            <tr>
              <td>Dados técnicos</td>
              <td>Endereço IP, tipo de dispositivo, registos de acesso</td>
              <td>Todos os utilizadores</td>
            </tr>
            <tr>
              <td>Dados de pagamento</td>
              <td>Processados diretamente pelo Stripe (quando ativo) — não guardamos dados de cartão</td>
              <td>Clientes e Profissionais</td>
            </tr>
          </tbody>
        </table>

        <h2>3. Finalidades e base legal</h2>
        <ul>
          <li>
            <strong className="text-foreground">Prestar o serviço da plataforma</strong> (criar conta, ligar
            clientes a profissionais, processar pedidos) — execução de contrato (art. 6.º/1/b RGPD).
          </li>
          <li>
            <strong className="text-foreground">Verificação de identidade de Profissionais</strong> —
            execução de contrato e interesse legítimo em manter uma plataforma segura (art. 6.º/1/b e f
            RGPD).
          </li>
          <li>
            <strong className="text-foreground">Comunicações de serviço</strong> (notificações de pedidos,
            orçamentos) — execução de contrato.
          </li>
          <li>
            <strong className="text-foreground">Comunicações de marketing</strong> (quando aplicável) —
            consentimento (art. 6.º/1/a RGPD), sempre com opção de recusa/anulação a qualquer momento.
          </li>
          <li>
            <strong className="text-foreground">Cumprimento de obrigações legais</strong> (ex.: fiscais,
            resposta a autoridades) — obrigação legal (art. 6.º/1/c RGPD).
          </li>
          <li>
            <strong className="text-foreground">Segurança e prevenção de fraude</strong> — interesse
            legítimo (art. 6.º/1/f RGPD).
          </li>
        </ul>

        <h2>4. Com quem partilhamos dados</h2>
        <p>Partilhamos dados apenas com subcontratantes estritamente necessários à operação da plataforma:</p>
        <ul>
          <li>Alojamento e infraestrutura (ex.: Railway, Vercel)</li>
          <li>Base de dados (PostgreSQL gerido)</li>
          <li>Armazenamento de ficheiros (Cloudflare R2)</li>
          <li>Processamento de pagamentos (Stripe), quando ativo</li>
          <li>Envio de notificações (Firebase Cloud Messaging), quando ativo</li>
          <li>Serviços de mapas e localização (Google Maps Platform), quando ativo</li>
        </ul>
        <p>
          Nunca vendemos dados pessoais a terceiros. Alguns destes subcontratantes podem estar sediados fora
          do Espaço Económico Europeu — nesses casos, garantimos mecanismos de transferência adequados (ex.:
          Cláusulas Contratuais-Tipo da Comissão Europeia).
        </p>

        <h2>5. Quanto tempo guardamos os dados</h2>
        <p>
          Os dados da conta são guardados enquanto a conta estiver ativa. Após a eliminação da conta,
          anonimizamos os dados de identificação, mantendo apenas o necessário para obrigações legais (ex.:
          faturação, por norma até 10 anos, nos termos da lei fiscal) e para integridade de registos
          associados a outros utilizadores (ex.: histórico de um trabalho concluído).
        </p>

        <h2>6. Os teus direitos</h2>
        <p>Nos termos do RGPD, tens direito a:</p>
        <ul>
          <li><strong className="text-foreground">Acesso</strong> — saber que dados temos sobre ti.</li>
          <li><strong className="text-foreground">Retificação</strong> — corrigir dados incorretos ou incompletos.</li>
          <li><strong className="text-foreground">Apagamento</strong> — pedir a eliminação dos teus dados (com as exceções legais acima).</li>
          <li><strong className="text-foreground">Portabilidade</strong> — receber os teus dados num formato estruturado.</li>
          <li><strong className="text-foreground">Oposição e limitação</strong> — opor-te a certos tratamentos, ou pedir a sua limitação.</li>
          <li><strong className="text-foreground">Retirar consentimento</strong> a qualquer momento, quando o tratamento se basear nele.</li>
        </ul>
        <p>
          Para exerceres estes direitos, contacta-nos em [email de privacidade/DPO]. Tens ainda o direito de
          apresentar reclamação junto da Comissão Nacional de Proteção de Dados (CNPD) —{' '}
          <a href="https://www.cnpd.pt" target="_blank" rel="noopener noreferrer">
            www.cnpd.pt
          </a>
          .
        </p>

        <h2>7. Cookies</h2>
        <p>
          Usamos cookies estritamente necessários ao funcionamento da plataforma (ex.: manter a sessão
          iniciada). Quando forem introduzidos cookies não essenciais (ex.: analítica, marketing), será
          pedido o teu consentimento explícito antes de serem ativados.
        </p>

        <h2>8. Segurança</h2>
        <p>
          Aplicamos medidas técnicas e organizativas adequadas para proteger os dados pessoais, incluindo
          encriptação de palavras-passe (Argon2id), ligações cifradas (HTTPS), controlo de acesso baseado em
          permissões, e registos de auditoria de ações sensíveis.
        </p>

        <h2>9. Alterações a esta Política</h2>
        <p>
          Podemos atualizar esta Política periodicamente. Alterações relevantes serão comunicadas com
          antecedência razoável através da plataforma ou por email.
        </p>
      </div>
    </div>
  );
}
