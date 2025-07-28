package com.example.appmobile;

import com.google.gson.annotations.SerializedName;

public class LoginResponse {
    @SerializedName("token")
    private String token;

    @SerializedName("COURRIEL")
    private String courriel;

    @SerializedName("ID_PATIENT")
    private int idPatient;

    public String getToken() { return token; }
    public String getCourriel() { return courriel; }
    public int getIdPatient() { return idPatient; }
}
