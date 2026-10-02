import { model, models, Schema, Types, type Model } from "mongoose";

export interface CategoryRecord {
  _id: Types.ObjectId;
  name: string;
  slug: string;
  description: string;
  image?: string;
  sortOrder: number;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const categorySchema = new Schema<CategoryRecord>(
  {
    name: { type: String, required: true, trim: true, maxlength: 80 },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true, maxlength: 100 },
    description: { type: String, required: true, trim: true, maxlength: 500, default: "" },
    image: { type: String, trim: true, maxlength: 2048 },
    sortOrder: { type: Number, required: true, min: 0, max: 1000, default: 0 },
    active: { type: Boolean, required: true, default: true },
  },
  { timestamps: true, versionKey: false },
);

categorySchema.index({ active: 1, sortOrder: 1, name: 1 });

const Category = (models.Category as Model<CategoryRecord> | undefined) ?? model<CategoryRecord>("Category", categorySchema);

export default Category;