import { Schema, model, Document } from "mongoose";

interface ProdutoInterface extends Document {
  nome: string;
  descricao?: string;
  categoria: "Espaços" | "Serviços" | "Equipamento";
  disponibilidade: Array<{ data: Date; horario: string }>;
  preco: number;
}

const produtoSchema = new Schema<ProdutoInterface>(
  {
    nome: { type: String, required: true, maxlength: 255 },
    descricao: { type: String },
    categoria: {
      type: String,
      enum: ["Espaços", "Serviços", "Equipamento"],
      required: true,
    },
    disponibilidade: [
      {
        data: { type: Date, required: true },
        horario: { type: String, required: true },
      },
    ],
    preco: { type: Number, required: true, min: 0 },
  },
  { versionKey: false },
);

const Produto = model<ProdutoInterface>("Produto", produtoSchema);

export default Produto;
