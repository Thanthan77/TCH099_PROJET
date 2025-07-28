package com.example.appmobile;

import com.google.gson.annotations.SerializedName;

public class LoginRequest {
    @SerializedName("COURRIEL")
    private String courriel;

    @SerializedName("MOT_DE_PASSE")
    private String motDePasse;

    public LoginRequest(String courriel, String motDePasse) {
        this.courriel = courriel;
        this.motDePasse = motDePasse;
    }
}
