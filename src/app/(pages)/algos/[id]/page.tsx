export default async function AlgoDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      <h1 className="text-2xl font-bold">Algo: {id}</h1>
      <p className="text-muted-foreground mt-2">Détail algo (mock tabs + viewer 3D à venir).</p>
    </main>
  );
}


