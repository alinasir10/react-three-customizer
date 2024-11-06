export const saveDesign = (design) => {
    try {
      const designs = JSON.parse(localStorage.getItem('tshirtDesigns') || '[]');
      const newDesign = { id: Date.now(), name: design.name || `Design ${designs.length + 1}`, timestamp: new Date().toISOString(), data: design };
      designs.push(newDesign);
      localStorage.setItem('tshirtDesigns', JSON.stringify(designs));
      return newDesign.id;
    } catch (error) {
      console.error('Error saving design:', error);
      return null;
    }
  };
  
  export const loadDesigns = () => {
    try {
      return JSON.parse(localStorage.getItem('tshirtDesigns') || '[]');
    } catch (error) {
      console.error('Error loading designs:', error);
      return [];
    }
  };
  
  export const loadDesign = (id) => {
    try {
      const designs = loadDesigns();
      return designs.find(design => design.id === id)?.data || null;
    } catch (error) {
      console.error('Error loading design:', error);
      return null;
    }
  };
  
  export const deleteDesign = (id) => {
    try {
      const designs = loadDesigns();
      const filteredDesigns = designs.filter(design => design.id !== id);
      localStorage.setItem('tshirtDesigns', JSON.stringify(filteredDesigns));
      return true;
    } catch (error) {
      console.error('Error deleting design:', error);
      return false;
    }
  };