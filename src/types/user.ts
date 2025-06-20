import { ISite } from "@/models/Site";
import { IUser } from "@/models/User";

export interface IUserPopulated extends Omit<IUser, "siteId"> {
  siteId: ISite;
}
