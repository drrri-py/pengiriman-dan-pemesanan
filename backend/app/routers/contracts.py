from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app import crud, schemas
from app.database import get_db

router = APIRouter()

# --- CLIENTS ---
@router.post("/clients/", response_model=schemas.ClientResponse)
def create_client(client: schemas.ClientCreate, db: Session = Depends(get_db)):
    return crud.create_client(db=db, client=client)

@router.get("/clients/", response_model=list[schemas.ClientResponse])
def read_clients(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud.get_clients(db, skip=skip, limit=limit)

@router.patch("/clients/{client_id}", response_model=schemas.ClientResponse)
def update_client(client_id: int, client_update: schemas.ClientUpdate, db: Session = Depends(get_db)):
    return crud.update_client(db=db, client_id=client_id, client_update=client_update)

@router.delete("/clients/{client_id}", response_model=dict)
def delete_client(client_id: int, db: Session = Depends(get_db)):
    crud.delete_client(db=db, client_id=client_id)
    return {"ok": True}

# --- CONTRACTS ---
@router.post("/contracts/", response_model=schemas.ContractResponse)
def create_contract(contract: schemas.ContractCreate, db: Session = Depends(get_db)):
    # You could add validation to check if the client_id exists
    return crud.create_contract(db=db, contract=contract)

@router.get("/contracts/", response_model=list[schemas.ContractResponse])
def read_contracts(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud.get_contracts(db, skip=skip, limit=limit)

@router.patch("/contracts/{contract_id}", response_model=schemas.ContractResponse)
def update_contract(contract_id: int, contract_update: schemas.ContractUpdate, db: Session = Depends(get_db)):
    return crud.update_contract(db=db, contract_id=contract_id, contract_update=contract_update)

@router.delete("/contracts/{contract_id}", response_model=dict)
def delete_contract(contract_id: int, db: Session = Depends(get_db)):
    crud.delete_contract(db=db, contract_id=contract_id)
    return {"ok": True}

# --- TRUCKS ---
@router.post("/trucks/", response_model=schemas.TruckResponse)
def create_truck(truck: schemas.TruckCreate, db: Session = Depends(get_db)):
    db_truck = crud.get_truck_by_plat(db, plat_nomor=truck.plat_nomor)
    if db_truck:
        raise HTTPException(status_code=400, detail="Truck with this license plate already registered")
    return crud.create_truck(db=db, truck=truck)

@router.get("/trucks/", response_model=list[schemas.TruckResponse])
def read_trucks(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud.get_trucks(db, skip=skip, limit=limit)

@router.patch("/trucks/{truck_id}", response_model=schemas.TruckResponse)
def update_truck(truck_id: int, truck_update: schemas.TruckUpdate, db: Session = Depends(get_db)):
    # ensure new plat does not collide
    if truck_update.plat_nomor:
        existing = crud.get_truck_by_plat(db, plat_nomor=truck_update.plat_nomor)
        if existing and existing.truck_id != truck_id:
            raise HTTPException(status_code=400, detail="Truck with this license plate already registered")
    return crud.update_truck(db=db, truck_id=truck_id, truck_update=truck_update)

@router.delete("/trucks/{truck_id}", response_model=dict)
def delete_truck(truck_id: int, db: Session = Depends(get_db)):
    crud.delete_truck(db=db, truck_id=truck_id)
    return {"ok": True}
