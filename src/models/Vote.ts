import mongoose, { Document, Model, Schema } from "mongoose";

export interface IVote extends Document {
  _id: string;
  siteId: mongoose.Types.ObjectId;
  createdBy: mongoose.Types.ObjectId;
  title: string;
  description: string;
  options: string[];
  votes: Array<{
    userId: mongoose.Types.ObjectId;
    option: number;
    votedAt: Date;
  }>;
  startDate: Date;
  endDate: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const VoteSchema = new Schema<IVote>(
  {
    siteId: { type: Schema.Types.ObjectId, ref: "Site", required: true },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    options: [{ type: String, required: true }],
    votes: [
      {
        userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
        option: { type: Number, required: true },
        votedAt: { type: Date, default: Date.now },
      },
    ],
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    isActive: { type: Boolean, default: true },
  },
  {
    timestamps: true,
  }
);

export const Vote: Model<IVote> =
  mongoose.models.Vote || mongoose.model<IVote>("Vote", VoteSchema);
