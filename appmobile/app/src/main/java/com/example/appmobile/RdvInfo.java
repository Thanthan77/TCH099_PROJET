package com.example.appmobile;

public class RdvInfo {

    public String jourRdv;
    public String heureRdv;

    public String typeRdv;

    public String courriel;


    public RdvInfo(String jourRdv, String heureRdv, String typeRdv) {

        this.jourRdv = jourRdv;
        this.heureRdv = heureRdv;
        this.typeRdv = typeRdv;

    }
    public String getHeureRdv() {
        return heureRdv;
    }

    public String getJourRdv() {
        return jourRdv;
    }

    public String getTypeRdv() {
        return typeRdv;
    }

    public String getCourriel() {
        return courriel;
    }

}
