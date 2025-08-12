package com.example.appmobile;

import com.google.gson.annotations.SerializedName;

public class RdvRequest {
    @SerializedName("NUM_RDV")
    private int numRdv;
    @SerializedName("DATE_RDV")
    private String dateRdv;
    @SerializedName("HEURE")
    private String heureRdv;
    @SerializedName("COURRIEL")
    private String courriel;
    @SerializedName("NOM_SERVICE")
    private String nomService;
    @SerializedName("ID_SERVICE")
    private int idRdv ;

    @SerializedName("NOM_EMPLOYE")
    private String medecin;

    /**
     * Constructeur de la classe RdvRequest.
     * @return
     */

    public int getNUMRdv() {
        return numRdv;
    }
    public String getDateRdv() {
        return dateRdv;
    }
    public String getHeureRdv() {
        return heureRdv;
    }
    public String getCourriel() {
        return courriel;
    }
    public String getNomService() {
        return nomService;
    }
    public int getIdRdv() {
        return idRdv;
    }
    public String getMedecin() {
        return medecin;
    }
}
