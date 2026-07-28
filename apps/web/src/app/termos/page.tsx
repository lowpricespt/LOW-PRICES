import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Termos de Serviço',
};

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="font-display text-3xl font-semibold tracking-tight">Termos de Serviço</h1>
      <p className="mt-2 text-sm text-muted-foreground">Última atualização: [preencher na publicação]</p>

      <div className="mt-8 rounded-lg border border-border bg-secondary p-4 text-sm text-muted-foreground">
        <strong className="text-foreground">Nota importante:</strong> este documento é um modelo base,
        preparado para cobrir os pontos exigidos por lei numa plataforma de intermediação de serviços em
        Portugal (Código Civil, Lei de Defesa do Consumidor, RGPD, Lei do Comércio Eletrónico — Decreto-Lei
        n.º 7/2004). <strong className="text-foreground">Não substitui aconselhamento jurídico</strong> — deve
        ser revisto por um advogado antes do lançamento público, e os campos entre parênteses retos têm de
        ser preenchidos com os dados reais. A plataforma opera, nesta fase, como atividade de pessoa singular
        (não como empresa constituída) — <strong className="text-foreground">recomenda-se vivamente abrir
        atividade como trabalhador independente nas Finanças</strong> (portal das Finanças, gratuito e online)
        antes de cobrar qualquer valor real a clientes ou profissionais, para poder emitir fatura-recibo e
        cumprir as obrigações fiscais. Sem isso, qualquer cobrança real é irregular perante a Autoridade
        Tributária.
      </div>

      <div className="mt-8 max-w-none space-y-6 text-sm leading-relaxed text-foreground [&_a]:text-primary [&_a]:underline [&_h2]:mt-8 [&_h2]:font-display [&_h2]:text-xl [&_h2]:font-semibold [&_li]:ml-5 [&_li]:list-disc [&_p]:text-muted-foreground [&_ul]:space-y-1">
        <h2>1. Quem somos</h2>
        <p>
          A Low Prices é operada por [Nome completo], contribuinte fiscal n.º [NIF], com domicílio fiscal em
          [morada], a operar como trabalhador independente (atividade aberta nas Finanças). Contacto: [email
          de contacto].
        </p>

        <h2>2. O que é a Low Prices</h2>
        <p>
          A Low Prices é uma plataforma de intermediação que liga Clientes a Profissionais independentes para
          a prestação de pequenos serviços locais (canalização, eletricidade, pintura, jardinagem, limpeza,
          mudanças, montagem de móveis, informática, entre outros).
        </p>
        <p>
          <strong className="text-foreground">A Low Prices não é parte no contrato de prestação de serviço</strong> entre
          o Cliente e o Profissional. O Profissional presta o serviço na qualidade de trabalhador
          independente, nunca como empregado, agente ou representante da Low Prices. A Low Prices não
          garante a qualidade, legalidade, segurança ou resultado de nenhum serviço prestado através da
          plataforma.
        </p>

        <h2>3. Criação de conta</h2>
        <p>
          Para usar a plataforma é necessário criar uma conta, fornecendo dados verdadeiros, completos e
          atualizados. É proibido criar contas em nome de terceiros sem autorização, ou usar identidades
          falsas. A conta é pessoal e intransmissível.
        </p>
        <p>
          O acesso está reservado a maiores de 18 anos. Ao criar uma conta, o utilizador declara ter pelo
          menos 18 anos.
        </p>

        <h2>4. Obrigações do Cliente</h2>
        <ul>
          <li>Fornecer uma descrição verdadeira e completa do serviço pretendido.</li>
          <li>Tratar os Profissionais com respeito e cumprir os compromissos assumidos (ex.: agendamentos).</li>
          <li>Pagar o valor acordado pelo serviço prestado.</li>
        </ul>

        <h2>5. Obrigações do Profissional</h2>
        <ul>
          <li>Possuir as qualificações, licenças e seguros exigidos por lei para a atividade que exerce.</li>
          <li>Prestar o serviço com a diligência e qualidade profissional esperadas.</li>
          <li>Cumprir as suas obrigações fiscais e de segurança social como trabalhador independente.</li>
          <li>Manter os documentos de verificação atualizados e verdadeiros.</li>
        </ul>

        <h2>6. Pagamentos e comissões</h2>
        <p>
          Quando o processamento de pagamentos estiver ativo na plataforma, os valores, comissões e condições
          aplicáveis serão comunicados de forma clara antes de cada transação, incluindo, quando aplicável,
          planos de subscrição para Profissionais. Ver secção específica de Preços/Planos na plataforma para
          os valores em vigor a cada momento.
        </p>

        <h2>7. Cancelamentos</h2>
        <p>
          Um pedido pode ser cancelado pelo Cliente antes de um orçamento ser aceite, sem qualquer custo.
          Após a aceitação de um orçamento, aplicam-se as condições de cancelamento comunicadas no momento da
          aceitação.
        </p>

        <h2>8. Avaliações e conduta</h2>
        <p>
          As avaliações devem refletir experiências reais e verdadeiras. É proibido publicar conteúdo
          ofensivo, discriminatório, difamatório ou fraudulento. A Low Prices reserva-se o direito de remover
          conteúdo que viole estes Termos e de suspender ou eliminar contas em caso de violação grave ou
          reiterada.
        </p>

        <h2>9. Propriedade intelectual</h2>
        <p>
          Todo o conteúdo da plataforma (marca, logótipo, design, código) é propriedade da Low Prices ou dos
          seus licenciantes, protegido por direitos de autor e propriedade industrial.
        </p>

        <h2>10. Limitação de responsabilidade</h2>
        <p>
          Na máxima medida permitida por lei, a Low Prices não é responsável por danos indiretos, lucros
          cessantes, ou danos resultantes da prestação (ou não prestação) de um serviço por um Profissional.
          Nada nestes Termos exclui responsabilidade que não possa ser legalmente excluída (ex.: dolo,
          negligência grave, ou direitos irrenunciáveis do consumidor).
        </p>

        <h2>11. Resolução de litígios</h2>
        <p>
          Em caso de reclamação, o utilizador pode contactar-nos através de [email de contacto]. Nos termos
          da lei portuguesa, a Low Prices disponibiliza Livro de Reclamações Eletrónico em{' '}
          <a href="https://www.livroreclamacoes.pt" target="_blank" rel="noopener noreferrer">
            www.livroreclamacoes.pt
          </a>
          . Os consumidores podem ainda recorrer a uma entidade de Resolução Alternativa de Litígios de
          Consumo — ver lista em{' '}
          <a href="https://www.consumidor.gov.pt" target="_blank" rel="noopener noreferrer">
            www.consumidor.gov.pt
          </a>
          .
        </p>

        <h2>12. Alterações aos Termos</h2>
        <p>
          Podemos atualizar estes Termos periodicamente. Alterações relevantes serão comunicadas com
          antecedência razoável através da plataforma ou por email.
        </p>

        <h2>13. Lei aplicável e foro</h2>
        <p>
          Estes Termos regem-se pela lei portuguesa. Para a resolução de qualquer litígio é competente o
          foro da comarca de [localidade], sem prejuízo dos direitos imperativos do consumidor que determinem
          foro diferente.
        </p>
      </div>
    </div>
  );
}
