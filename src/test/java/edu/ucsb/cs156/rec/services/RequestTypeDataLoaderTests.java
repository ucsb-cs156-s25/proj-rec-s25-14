package edu.ucsb.cs156.rec.services;

import edu.ucsb.cs156.rec.entities.RequestType;
import edu.ucsb.cs156.rec.repositories.RequestTypeRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.boot.CommandLineRunner;

import java.util.Optional;

import static org.mockito.Mockito.*;
import static org.junit.jupiter.api.Assertions.*;

class RequestTypeDataLoaderTests {

    private RequestTypeRepository requestTypeRepository;
    private RequestTypeDataLoader requestTypeDataLoader;

    @BeforeEach
    void setup() {
        requestTypeRepository = mock(RequestTypeRepository.class);
        requestTypeDataLoader = new RequestTypeDataLoader();
        try {
            var field = RequestTypeDataLoader.class.getDeclaredField("requestTypeRepository");
            field.setAccessible(true);
            field.set(requestTypeDataLoader, requestTypeRepository);
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    @Test
    void test_loadRequestTypes_inserts_new_entries_if_not_exists() throws Exception {
        when(requestTypeRepository.findByRequestType(anyString())).thenReturn(Optional.empty());

        requestTypeDataLoader.run();

        ArgumentCaptor<RequestType> captor = ArgumentCaptor.forClass(RequestType.class);
        verify(requestTypeRepository, times(4)).save(captor.capture());

        var savedTypes = captor.getAllValues();
        assertEquals(4, savedTypes.size());
        assertTrue(savedTypes.stream().anyMatch(rt -> rt.getRequestType().equals("CS Department BS/MS program")));
        assertTrue(savedTypes.stream().anyMatch(rt -> rt.getRequestType().equals("Scholarship or Fellowship")));
        assertTrue(savedTypes.stream().anyMatch(rt -> rt.getRequestType().equals("MS program (other than CS Dept BS/MS)")));
        assertTrue(savedTypes.stream().anyMatch(rt -> rt.getRequestType().equals("PhD program")));
    }

    @Test
    void test_loadRequestTypes_does_not_insert_if_exists() throws Exception {
        when(requestTypeRepository.findByRequestType(anyString())).thenReturn(Optional.of(new RequestType()));

        requestTypeDataLoader.run();

        verify(requestTypeRepository, never()).save(any());
    }
}
