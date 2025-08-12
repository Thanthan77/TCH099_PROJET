package com.example.appmobile.PagesRDV;
import com.google.gson.annotations.SerializedName;
public class FiltreHeureRequest {
    @SerializedName("HEURE")
    private String heureRdv ;

    @SerializedName("PRENOM_EMPLOYE")
    private String prenomEmploye ;

    @SerializedName("NOM_SERVICE")
    private String nomService ;

    @SerializedName("JOUR")
    private String jourRdv ;

    @SerializedName("NOM_EMPLOYE")
    private String nomEmploye ;




    public String getHeureRdv() {
        return heureRdv;
    }

    public String getPrenomEmploye() {
        return prenomEmploye;
    }

    public String getNomService() {
        return nomService;
    }

    public String getNomEmploye() {
        return nomEmploye;
    }

    public String getJourRdv() {
        return jourRdv;
    }
}
