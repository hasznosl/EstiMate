import { IRealmDocumentNameType, IRealmObjects } from "../utils/types";
import realmParams3 from "../../migration/realmParams3";
import Realm from "realm";

const persistency = (function() {
  let database = null;

  const initializePersistency = async () =>
    (database = await new Realm(realmParams3));

  const getDatabase = () => database;

  const create = async ({
    document,
    instance
  }: {
    readonly document: IRealmDocumentNameType;
    readonly instance: any;
  }) => {
    let createdInstance = null;
    await database.write(async () => {
      createdInstance = await database.create(document, instance);
    });
    return createdInstance;
  };

  const remove = async ({ instance }: { readonly instance: any }) =>
    database.write(() => database.delete(instance));

  const purge = async () =>
    database.write(() => {
      database.deleteAll();
    });
  const getDocuments = async ({
    documentName
  }: {
    documentName: IRealmDocumentNameType;
  }): Promise<IRealmObjects> => database.objects(documentName);

  const removeDocumentAndSubdocuments = async ({
    documentInstance,
    subdocumentNamePlural
  }: {
    documentInstance: any;
    subdocumentNamePlural: string;
  }) =>
    database.write(() => {
      database.delete(documentInstance[subdocumentNamePlural]);
      database.delete(documentInstance);
    });

  const createDocumentAndPushToParentDocument = async ({
    documentInstance,
    parentDocument,
    documentName,
    documentNamePlural
  }: {
    readonly documentInstance: any;
    readonly parentDocument: any;
    readonly documentName: IRealmDocumentNameType;
    readonly documentNamePlural: string;
  }) =>
    database.write(async () => {
      const document = database.create(
        IRealmDocumentNameType[documentName],
        documentInstance
      );
      parentDocument[documentNamePlural].push(document);
    });

  return {
    database,
    getDatabase,
    initializePersistency,
    create,
    createDocumentAndPushToParentDocument,
    purge,
    remove,
    removeDocumentAndSubdocuments,
    getDocuments
  };
})();

export default persistency;
