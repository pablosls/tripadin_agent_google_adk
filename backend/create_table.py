import psycopg2

conn = psycopg2.connect("postgresql://postgres:eohUq6X4WqVfcMCj@db.dkozosqnqbivvgteqyao.supabase.co:5432/postgres")
cur = conn.cursor()

cur.execute("""
CREATE TABLE IF NOT EXISTS saved_cards (
    id SERIAL PRIMARY KEY,
    user_id TEXT NOT NULL,
    card_id TEXT NOT NULL,
    destination TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    image TEXT,
    type TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
""")

conn.commit()
cur.close()
conn.close()
print("Tabela criada com sucesso!")
