import { SERVICE_CATEGORIES } from '@/constants/categories';

export function PopularCategories() {
  return (
    <section id="categorias" className="py-16 sm:py-20">
      <div className="container">
        <div className="mx-auto mb-10 max-w-xl text-center sm:mb-14">
          <h2 className="font-display text-2xl font-semibold tracking-tight sm:text-3xl md:text-4xl">
            Categorias populares
          </h2>
          <p className="mt-3 text-muted-foreground">
            Os serviços mais pedidos por quem já usa a Low Prices.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
          {SERVICE_CATEGORIES.map((category) => (
            <button
              key={category.id}
              type="button"
              className="group flex flex-col items-center gap-3 rounded-2xl border border-border bg-background p-5 text-center transition-colors hover:border-primary/40 hover:bg-primary/5 sm:p-6"
            >
              <span className="flex size-11 items-center justify-center rounded-xl bg-secondary transition-colors group-hover:bg-primary/10 sm:size-12">
                <category.icon className="size-5 text-muted-foreground transition-colors group-hover:text-primary sm:size-6" />
              </span>
              <span className="text-sm font-medium">{category.name}</span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
