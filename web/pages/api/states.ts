let updateRequired = false;

export const setUpdateRequired = (value: boolean) => {
  updateRequired = value;
};

export const getUpdateRequired = () => updateRequired;