package com.example.appmobile;

import com.google.gson.annotations.SerializedName;

public class RdvRequest {

    @SerializedName("NUM_RDV")
    private int numRdv;

    @SerializedName("JOUR")
    private String jourRdv;

    @SerializedName("HEURE")
    private String heureRdv;


    @SerializedName("COURRIEL")
    private String courriel;

    @SerializedName("NOM_SERVICE")
    private String nomService;

    @SerializedName("ID_SERVICE")
    private int idRdv ;





    public int getNUMRdv() {
        return numRdv;
    }

    public String getJourRdv() {
        return jourRdv;
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
}
