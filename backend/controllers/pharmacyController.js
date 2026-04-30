const Pharmacy = require('../models/Pharmacy');
const Prescription = require('../models/Prescription');

// Get all pharmacies
const getAllPharmacies = async (req, res) => {
  try {
    const pharmacies = await Pharmacy.find({ isActive: true });
    res.json(pharmacies);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get pharmacy by ID
const getPharmacyById = async (req, res) => {
  try {
    const pharmacy = await Pharmacy.findById(req.params.id);
    if (!pharmacy) {
      return res.status(404).json({ message: 'Pharmacy not found' });
    }
    res.json(pharmacy);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Check medicine availability in a pharmacy
const checkMedicineAvailability = async (req, res) => {
  try {
    const { prescriptionId } = req.body;

    const prescription = await Prescription.findById(prescriptionId);
    if (!prescription) {
      return res.status(404).json({ message: 'Prescription not found' });
    }

    const medicineNames = prescription.medicines.map((med) => med.name);
    const pharmacies = await Pharmacy.find({ isActive: true });

    const availabilityResults = pharmacies.map((pharmacy) => {
      const availableMedicines = [];
      const unavailableMedicines = [];
      let totalCost = 0;

      prescription.medicines.forEach((medicine) => {
        const pharmacyMedicine = pharmacy.medicines.find(
          (pm) => pm.name.toLowerCase() === medicine.name.toLowerCase()
        );

        if (pharmacyMedicine && pharmacyMedicine.isAvailable && pharmacyMedicine.quantity > 0) {
          availableMedicines.push({
            name: medicine.name,
            dosage: medicine.dosage,
            cost: pharmacyMedicine.cost,
            quantity: pharmacyMedicine.quantity,
          });
          totalCost += pharmacyMedicine.cost;
        } else {
          unavailableMedicines.push({
            name: medicine.name,
            dosage: medicine.dosage,
          });
        }
      });

      return {
        pharmacyId: pharmacy._id,
        pharmacyName: pharmacy.name,
        address: pharmacy.address,
        phone: pharmacy.phone,
        openingTime: pharmacy.openingTime,
        closingTime: pharmacy.closingTime,
        deliveryAvailable: pharmacy.deliveryAvailable,
        rating: pharmacy.rating,
        availableMedicines,
        unavailableMedicines,
        totalCost,
        availabilityPercentage: Math.round(
          (availableMedicines.length / prescription.medicines.length) * 100
        ),
      };
    });

    res.json(availabilityResults);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get pharmacies near user location
const getNearbyPharmacies = async (req, res) => {
  try {
    const { latitude, longitude, radius = 5 } = req.body;

    if (!latitude || !longitude) {
      return res.status(400).json({ message: 'Location coordinates required' });
    }

    const pharmacies = await Pharmacy.find({ isActive: true });

    const nearbyPharmacies = pharmacies.filter((pharmacy) => {
      if (!pharmacy.address?.latitude || !pharmacy.address?.longitude) {
        return false;
      }

      const distance = calculateDistance(
        latitude,
        longitude,
        pharmacy.address.latitude,
        pharmacy.address.longitude
      );

      return distance <= radius;
    });

    res.json(nearbyPharmacies);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Calculate distance between two coordinates
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

// Create pharmacy (admin only)
const createPharmacy = async (req, res) => {
  try {
    const pharmacy = new Pharmacy(req.body);
    await pharmacy.save();
    res.status(201).json(pharmacy);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update pharmacy (admin only)
const updatePharmacy = async (req, res) => {
  try {
    const pharmacy = await Pharmacy.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!pharmacy) {
      return res.status(404).json({ message: 'Pharmacy not found' });
    }
    res.json(pharmacy);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getAllPharmacies,
  getPharmacyById,
  checkMedicineAvailability,
  getNearbyPharmacies,
  createPharmacy,
  updatePharmacy,
};
