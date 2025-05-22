package edu.ucsb.cs156.rec.services;

import edu.ucsb.cs156.rec.entities.RequestType;
import edu.ucsb.cs156.rec.repositories.RequestTypeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.Arrays;
import java.util.Optional;

@Component
public class RequestTypeDataLoader implements CommandLineRunner {

    @Autowired
    private RequestTypeRepository requestTypeRepository;

    @Override
    public void run(String... args) throws Exception {
        loadRequestTypes();
    }

    private void loadRequestTypes() {
        String[] requestTypes = {
            "CS Department BS/MS program",
            "Scholarship or Fellowship",
            "MS program (other than CS Dept BS/MS)",
            "PhD program"
        };

        Arrays.stream(requestTypes).forEach(type -> {
            Optional<RequestType> existing = requestTypeRepository.findByRequestType(type);
            if (!existing.isPresent()) {
                RequestType newType = new RequestType();
                newType.setRequestType(type);
                requestTypeRepository.save(newType);
                
            }
        });
    }
}