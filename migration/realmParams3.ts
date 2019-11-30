import realmParams1, {
  currency,
  account,
  transaction,
  birthday,
  importantDate,
  virtualSpending,
  financialGoal
} from "./realmParams2";
import { IRealmDocumentNameType } from "../src/utils/types";

export default {
  ...realmParams1,
  schema: [
    currency,
    {
      ...account,
      properties: {
        ...account.properties,
        deteriorationConstant: { type: "float", default: 0 }
      }
    },
    transaction,
    birthday,
    importantDate,
    virtualSpending,
    financialGoal
  ],
  migration: (oldRealm, newRealm) => {
    if (oldRealm.schemaVersion === 2) {
      const oldAccounts = oldRealm.objects(IRealmDocumentNameType.account);
      const newAccounts = newRealm.objects(IRealmDocumentNameType.account);
      for (let i = 0; i < oldAccounts.length; i++) {
        newAccounts[i].deteriorationConstant = 0;
      }
    }
  },
  schemaVersion: 3
};
