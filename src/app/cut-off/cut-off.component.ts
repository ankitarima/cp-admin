import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import firebase from 'firebase/app';
import * as XLSX from 'xlsx';
import { first } from 'rxjs/operators';
import { FormControl, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-cut-off',
  templateUrl: './cut-off.component.html',
  styleUrls: ['./cut-off.component.css']
})
export class CutOffComponent implements OnInit {
  public fileName: String | undefined;
  public cuttOffData: any;
  public cList = [] as any;
  public isLoading = false;
  public cutt_off = [] as any

  cform = new FormGroup({
    file: new FormControl('',Validators.required),
    slug: new FormControl('',Validators.required),
    year: new FormControl('',Validators.required)

  });

  sForm = new FormGroup({
    college: new FormControl('', Validators.required)
  })

  target: DataTransfer | undefined;

  constructor(
    private db: AngularFirestore
  ) { }

  ngOnInit(): void {

    this.db.collection('college_reviews').get().pipe(first()).subscribe((resp)=>{
      resp.docs.forEach((data => {
        const test = data.data() as any;
        Object.assign(test,{id: data.id})
        this.cList.push(test);
      }))
      console.log(this.cList)
    })

  }

  onFileChange(evt: any): any {
    console.log('in file change')
    this.target = (evt.target) as DataTransfer;
    this.fileName = this.target.files[0].name;
  }

  cuttOffMaker(target:any , fileName){

    if (fileName.endsWith('xlsx') || fileName.endsWith('xls')) {

      const reader: FileReader = new FileReader();
      reader.onload = (e: any) => {

        // Reading as binary string
        const bstr: string = e.target.result;

        // Reading and converting binary string to XLXS
        const wb: XLSX.WorkBook = XLSX.read(bstr, { type: 'binary' });
        const cuttOffData: string = wb.SheetNames[0];

        // Reading the cuttOffData sheet in XLSX
        const cos: XLSX.WorkSheet = wb.Sheets[cuttOffData];
        const roa = (XLSX.utils.sheet_to_json(cos, { header: 1 })) as any;

        const cs=[] as any
        roa.forEach(element => {
          const obj = {
            [roa[0][0]]: element[0],
            [roa[0][1]]: element[1],
            [roa[0][2]]: element[2],
            [roa[0][3]]: element[3],
            [roa[0][4]]: element[4],
            [roa[0][5]]: element[5],
            [roa[0][6]]: element[6],
            [roa[0][7]]: element[7] || null,
            [roa[0][8]]: element[8] || null,
            [roa[0][9]]: element[9] || null,
            [roa[0][10]]: element[10] || null,
            [roa[0][11]]: element[11] || null,
          }
          cs.push(obj);
        });
        cs.shift();
        console.log(cs)
        this.cuttOffData = cs;
      };
      reader.readAsBinaryString(target.files[0]);

    }
  }

  onSubmit(){
    if(this.cform.invalid){
      alert('All field are required');
      return
    }else if(this.cform.value.file){
      this.isLoading = true;
      this.cuttOffMaker(this.target, this.fileName);
      const cuttoffs = [] as any;
      this.db.collection('cutt_off').ref.where('college_slug','==', this.cform.value.slug).get().then((resp)=>{
        resp.forEach((val:any)=>{
          cuttoffs.push(val.data().year)
        })
      }).then(()=>{
        if(!cuttoffs.includes(this.cform.value.year)){
          this.db.collection('cutt_off').add({
            college_slug: this.cform.value.slug,
            year: this.cform.value.year,
            cuttoff: this.cuttOffData
          }).then(()=>{
            this.cform.reset()
            this.cuttOffData = []
            this.isLoading = false;
          })
        }else{
          alert('Data alreday exists for the year!');
          this.isLoading = false;
        }
      })
    }
  }

  getData(){
    this.cutt_off = []
    this.db.collection('cutt_off').ref.where('college_slug','==', this.sForm.value.college).get().then((resp)=>{
      resp.forEach((data:any)=>{
        const co = data.data() as any;
        Object.assign(co,{id: data.id});
        // console.log((JSON.parse(co.cuttoff)))
        // JSON.parse(co.cuttoff).map(val=>console.log(val))
        co.cuttoff.map(val=>console.log(val))
        this.cutt_off.push(co);
      })
      // console.log(typeof(this.cutt_off.cuttoff))
    })

  }

  delete(co){
    let conf = confirm("Do you want to delete "+co.year+" cuttoff");
    if(conf){
      this.db.doc('cutt_off/'+co.id).delete().then(()=>{
        this.db.collection('cutt_off').ref.where('college_slug','==', co.college_slug).get().then((resp)=>{
          this.cutt_off = []
          resp.forEach((data:any)=>{
            const co = data.data() as any;
            Object.assign(co,{id: data.id})
            this.cutt_off.push(co);
          })
        })
      })
    }

  }

  clearSearch(){
    this.sForm.reset();
    this.cutt_off=[]
  }

}
