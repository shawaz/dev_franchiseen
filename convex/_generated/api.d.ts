/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";
import type * as admin from "../admin.js";
import type * as approvals from "../approvals.js";
import type * as brands from "../brands.js";
import type * as categories from "../categories.js";
import type * as franchise from "../franchise.js";
import type * as industries from "../industries.js";
import type * as investments from "../investments.js";
import type * as myFunctions from "../myFunctions.js";
import type * as platformTeam from "../platformTeam.js";
import type * as setup from "../setup.js";
import type * as shares from "../shares.js";
import type * as teams from "../teams.js";
import type * as transactions from "../transactions.js";
import type * as uploadLogo from "../uploadLogo.js";
import type * as uploadcare from "../uploadcare.js";
import type * as users from "../users.js";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  admin: typeof admin;
  approvals: typeof approvals;
  brands: typeof brands;
  categories: typeof categories;
  franchise: typeof franchise;
  industries: typeof industries;
  investments: typeof investments;
  myFunctions: typeof myFunctions;
  platformTeam: typeof platformTeam;
  setup: typeof setup;
  shares: typeof shares;
  teams: typeof teams;
  transactions: typeof transactions;
  uploadLogo: typeof uploadLogo;
  uploadcare: typeof uploadcare;
  users: typeof users;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;
