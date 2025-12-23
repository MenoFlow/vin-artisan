/**
 * Service pour gérer les pays partenaires
 */

import { toast } from "sonner";

export interface Country {
  code: string;
  name: string;
}

/**
 * Récupère la liste des pays partenaires
 */
export const getPartnerCountries = async (): Promise<Country[]> => {
  try {
    const response = await fetch(
      "https://vinexpert-backend.vercel.app/api/partenaire",
      {
        method: "GET",
      }
    );
    const data = await response.json();
    return data;
  } catch (err) {
    console.error("Erreur API : " + err);
    toast.error("Erreur lors de la récupération des pays partenaires");
    throw err;
  }
};

/**
 * Sauvegarde une nouvelle liste de pays partenaires
 */
export const savePartnerCountries = (countries: Country[]): void => {
  localStorage.setItem("partnerCountries", JSON.stringify(countries));
};

/**
 * Ajoute un pays à la liste des partenaires
 */
export const addPartnerCountry = async (country: Country): Promise<void> => {
  try {
    const countries = await getPartnerCountries();

    let stateBreak = false;
    countries.map((countri) => {
      if (countri.code === country.code || countri.name === country.name) {
        toast.error("Ce pays fait déjà partie des partenaires");

        stateBreak = true;
      }
    });
    if (stateBreak) {
      return;
    }

    console.log(country);

    const response = await fetch(
      "https://vinexpert-backend.vercel.app/api/partenaire",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(country),
      }
    );
    console.log(response);

    if (!response.ok) {
      throw new Error("Erreur lors de l'ajout du pays partenaire");
    }
    toast.success("Pays partenaire ajouté avec succès");
    return;
  } catch (err) {
    console.error("Erreur API : " + err);
    toast.error("Erreur lors de l'ajout du pays partenaire");
    throw err;
  }
};

/**
 * Vérifie si le pays est partenaire
 */
export const isPartnerCountry = async (
  countryCode: string
): Promise<boolean> => {
  const countries = await getPartnerCountries();
  return countries.some(
    (c) => c.code.toUpperCase() === countryCode.toUpperCase()
  );
};

/**
 * Vérifie la géolocalisation de l'utilisateur et si son pays est partenaire
 */
export const checkUserCountryIsPartner = async () => {
  try {
    const response = await fetch("https://ipapi.co/json/");
    if (!response.ok) {
      throw new Error("Impossible de déterminer la localisation");
    }

    const data = await response.json();
    const countryCode = data.country_code;
    const countryName = data.country_name;

    if (!countryCode) {
      throw new Error("Pays non détecté");
    }

    const isPartner = await isPartnerCountry(countryCode);

    return {
      isPartner,
      country: {
        code: countryCode,
        name: countryName,
      },
    };
  } catch (error) {
    console.error("Erreur lors de la vérification du pays:", error);
    return {
      isPartner: false,
      error: error instanceof Error ? error.message : "Erreur inconnue",
    };
  }
};
