export const formatCAD = (amount) => {
  return `CA$ ${Number(amount).toLocaleString("en-CA", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};