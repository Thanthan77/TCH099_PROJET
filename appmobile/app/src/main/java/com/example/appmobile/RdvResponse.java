package com.example.appmobile;

import com.google.gson.annotations.SerializedName;
import java.util.List;

public class RdvResponse {

    @SerializedName("patient")
    private Patient patient;

    @SerializedName("rendezvous")
    private List<RdvRequest> rendezvous;

    public Patient getPatient() {
        return patient;
    }

    public List<RdvRequest> getRendezvous() {
        return rendezvous;
    }
}