import { Divider, Select, Option } from "@mui/joy";
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { useGlobalStore } from "@/store/module";
import * as api from "@/helpers/api";
import showCreateStorageServiceDialog from "../CreateStorageServiceDialog";
import showUpdateLocalStorageDialog from "../UpdateLocalStorageDialog";
import Dropdown from "../base/Dropdown";
import { showCommonDialog } from "../Dialog/CommonDialog";

const StorageSection = () => {
  const { t } = useTranslation();
  const globalStore = useGlobalStore();
  const systemStatus = globalStore.state.systemStatus;
  const [storageServiceId, setStorageServiceId] = useState(systemStatus.storageServiceId);
  const [storageList, setStorageList] = useState<ObjectStorage[]>([]);

  useEffect(() => {
    fetchStorageList();
  }, []);

  const fetchStorageList = async () => {
    const {
      data: { data: storageList },
    } = await api.getStorageList();
    setStorageList(storageList);
  };

  const handleActiveStorageServiceChanged = async (storageId: StorageId) => {
    await api.upsertSystemSetting({
      name: "storage-service-id",
      value: JSON.stringify(storageId),
    });
    await globalStore.fetchSystemStatus();
    setStorageServiceId(storageId);
  };

  const handleDeleteStorage = (storage: ObjectStorage) => {
    showCommonDialog({
      title: t("setting.storage-section.delete-storage"),
      content: t("setting.storage-section.warning-text"),
      style: "warning",
      dialogName: "delete-storage-dialog",
      onConfirm: async () => {
        try {
          await api.deleteStorage(storage.id);
        } catch (error: any) {
          console.error(error);
          toast.error(error.response.data.message);
        }
        await fetchStorageList();
      },
    });
  };

  return (
    <div className="section-container">
      <div className="mt-4 mb-2 w-full flex flex-row justify-start items-center">
        <span className="font-mono text-sm text-gray-400 mr-2">Current storage</span>
      </div>
      <Select
        className="w-full mb-4"
        value={storageServiceId}
        onChange={(_, storageId) => {
          handleActiveStorageServiceChanged(storageId ?? storageServiceId);
        }}
      >
        <Option value={0}>Database</Option>
        <Option value={-1}>Local</Option>
        {storageList.map((storage) => (
          <Option key={storage.id} value={storage.id}>
            {storage.name}
          </Option>
        ))}
      </Select>
      <Divider />
      <div className="mt-4 mb-2 w-full flex flex-row justify-start items-center">
        <span className="font-mono text-sm text-gray-400 mr-2">{t("setting.storage-section.storage-services-list")}</span>
        <button className="btn-normal px-2 py-0 leading-7" onClick={() => showCreateStorageServiceDialog(undefined, fetchStorageList)}>
          {t("common.create")}
        </button>
      </div>
      <div className="mt-2 w-full flex flex-col">
        <div className="py-2 w-full border-t dark:border-zinc-700 flex flex-row items-center justify-between">
          <div className="flex flex-row items-center">
            <p className="ml-2">Local</p>
          </div>
          <div className="flex flex-row items-center">
            <Dropdown
              actionsClassName="!w-28"
              actions={
                <>
                  <button
                    className="w-full text-left text-sm leading-6 py-1 px-3 cursor-pointer rounded hover:bg-gray-100 dark:hover:bg-zinc-600"
                    onClick={() => showUpdateLocalStorageDialog(systemStatus.localStoragePath)}
                  >
                    Edit
                  </button>
                </>
              }
            />
          </div>
        </div>
        {storageList.map((storage) => (
          <div
            key={storage.id}
            className="py-2 w-full border-t last:border-b dark:border-zinc-700 flex flex-row items-center justify-between"
          >
            <div className="flex flex-row items-center">
              <p className="ml-2">{storage.name}</p>
            </div>
            <div className="flex flex-row items-center">
              <Dropdown
                actionsClassName="!w-28"
                actions={
                  <>
                    <button
                      className="w-full text-left text-sm leading-6 py-1 px-3 cursor-pointer rounded hover:bg-gray-100 dark:hover:bg-zinc-600"
                      onClick={() => showCreateStorageServiceDialog(storage, fetchStorageList)}
                    >
                      Edit
                    </button>
                    <button
                      className="w-full text-left text-sm leading-6 py-1 px-3 cursor-pointer rounded text-red-600 hover:bg-gray-100 dark:hover:bg-zinc-600"
                      onClick={() => handleDeleteStorage(storage)}
                    >
                      {t("common.delete")}
                    </button>
                  </>
                }
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StorageSection;
