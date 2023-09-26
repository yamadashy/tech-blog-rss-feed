module.exports = function() {
  const datesArray = [];
  const today = new Date();
  
  for(let i = 0; i < 7; i++) {
    const newDate = new Date(today);
    newDate.setDate(today.getDate() - i);
    const formattedDate = `${newDate.getFullYear()}-${String(newDate.getMonth() + 1).padStart(2, '0')}-${String(newDate.getDate()).padStart(2, '0')}`;
    datesArray.push(formattedDate);
  }

  return datesArray;
};
