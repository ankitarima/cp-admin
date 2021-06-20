import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { AngularFireStorage} from '@angular/fire/storage'
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { first, finalize } from 'rxjs/operators';
import { IDropdownSettings } from 'ng-multiselect-dropdown';

import  Quill  from 'quill';
import  ImageResize  from 'quill-image-resize-module';
import { HttpClient } from '@angular/common/http';

Quill.register('modules/imageResize', ImageResize);

@Component({
  selector: 'app-mock-test',
  templateUrl: './mock-test.component.html',
  styleUrls: ['./mock-test.component.css']
})
export class MockTestComponent implements OnInit {

  editor_modules = {
    toolbar: {
      container: [
        [{ 'font': [] }],
        [{ 'size': ['small', false, 'large', 'huge'] }],
        ['bold', 'italic', 'underline', 'strike'],
        ['blockquote'],
        [{ 'script': 'sub'}, { 'script': 'super' }],
        [{ 'indent': '-1'}, { 'indent': '+1' }],
        [{ 'header': 1 }, { 'header': 2 }],
        [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
        [{ 'color': [] }, { 'background': [] }],
        [{ 'list': 'ordered' }, { 'list': 'bullet' }],
        [{ 'align': [] }],
        ['link', 'image']
      ]
    },
    imageResize: true
  };

  eform = new FormGroup({
    id: new FormControl(null),
    question: new FormControl('', Validators['required']),
    test_name: new FormControl('', Validators['required']),
    option1: new FormControl('', Validators['required']),
    option2: new FormControl('', Validators['required']),
    option3: new FormControl('', Validators['required']),
    option4: new FormControl('', Validators['required']),
    correct_option: new FormControl('', Validators['required']),
    level: new FormControl('', Validators['required']),
    subject: new FormControl('',Validators['required']),
    section: new FormControl(null),
    postive_mark: new FormControl(null),
    negetive_mark: new FormControl(null)

  });
  sForm = new FormGroup({
    test: new FormControl('', Validators.required)
  })

  text: any;
  fc: any;
  mockTestLists = [] as any;
  lBtn = false;

  questionsList = [] as any;
  isql = false;
  isqm = true;

  iswbjee = false;

  pq: any;
  public isPreview = false as any;
  path: any;
  uploading = false as any;
  imgSrc = "assets/images/placeholder-image.png"

  dropdownList = [] as any;
  selectedItems = [] as any;
  dropdownSettings = {} as any;

  mock_test = [] as any


  constructor(
    private db: AngularFirestore,
    private fs: AngularFireStorage,
    private http: HttpClient
  ) { }

  ngOnInit(): void {

    console.log('in get')
    this.db.collection('mock_tests_new').get().subscribe((querySnapshot) => {
     let idc = 1;
     querySnapshot.forEach((data) => {
       const mocktest = data.data() as any;
       let MockTest = { id: idc, slug : mocktest.slug, name : mocktest.test_name }
       this.mockTestLists.push(MockTest)
       idc++;
     })
     console.log(this.mockTestLists);

     this.dropdownList = this.mockTestLists

    this.dropdownSettings = {
      singleSelection: false,
      idField: 'slug',
      textField: 'name',
      selectAllText: 'Select All',
      unSelectAllText: 'Remove All',
      itemsShowLimit: 3,
      allowSearchFilter: true
    };
  })

  }

  onItemSelect(item: any) {

    console.log(item.slug.split('-')[0]);
    if(item.slug.split('-')[0] === 'wbjee'){
      this.iswbjee=true;
      this.mock_test = [item.slug];
    }else if(!this.iswbjee){
      this.mock_test.push(item.slug);
      // if(this.mock_test.indexOf(item.slug) !== -1){
      //   alert("Value exists!")
      // } else{

      // }
    }
    console.log(this.mock_test);

  }
  onSelectAll(items: any) {
    this.mock_test = []
    items.forEach(item => {
      this.mock_test.push(item.slug);
    });
    // console.log(this.mock_test)
  }

  onDeSelect(item: any) {
    if(item.slug.split('-')[0] === 'wbjee'){
      this.iswbjee=false;
    }
    this.mock_test = this.mock_test.filter((val)=>{
      if(item.slug !== val){
        return val
      }
    })
    // console.log(this.mock_test);
  }

  onDeSelectAll(items:any){
    this.mock_test = [];
    this.iswbjee=false;
  }

  preview(data){
    this.isPreview = data;
    this.pq = data;
    if(data != false){
      let element: HTMLElement = document.getElementById('previewbtn') as HTMLElement;
      element.click();
    }
  }

  onSubmit() {
    if (this.isPreview == true) {
      // alert('in preview');
      this.pq = this.eform.value;
      return
    } else if (this.isPreview == false) {

      this.lBtn = true;
      if (this.eform.invalid) {
        alert('All fields are required');
        this.lBtn = false;
        return
      }

      else if(this.iswbjee){
        if( this.eform.value.postive_mark != null && this.eform.value.negetive_mark != null && this.eform.value.section != null){
          this.db.collection('questions').add({
            question: this.eform.value.question,
            option1: this.eform.value.option1,
            option2: this.eform.value.option2,
            option3: this.eform.value.option3,
            option4: this.eform.value.option4,
            correct_option: this.eform.value.correct_option,
            mock_test: this.mock_test,
            level: this.eform.value.level,
            subject: this.eform.value.subject,
            section: Number(this.eform.value.section),
            postive_mark: this.eform.value.postive_mark,
            negetive_mark: this.eform.value.negetive_mark
          }).then(resp => {
              this.eform.reset();
              this.mock_test = [];
              this.iswbjee = false;
              this.lBtn = false;
          }).catch((err) => {
            alert('Server error! contact admin');
            this.lBtn = false;
          })

        }else{
          alert('For wbjee , enter question marks also');
          this.lBtn = false;
        }
      }

      else if (this.eform.value.id == null) {
        this.db.collection('questions').add({
          question: this.eform.value.question,
          option1: this.eform.value.option1,
          option2: this.eform.value.option2,
          option3: this.eform.value.option3,
          option4: this.eform.value.option4,
          correct_option: this.eform.value.correct_option,
          mock_test: this.mock_test,
          level: this.eform.value.level,
          subject: this.eform.value.subject
        }).then(resp => {
          this.db.collection('questions').valueChanges().pipe(first()).subscribe(resp => {
            console.log(resp);
            this.eform.reset();
            this.mock_test = [];
            this.lBtn = false;
          })
        }).catch((err) => {
          alert('Server error! contact admin');
          this.lBtn = false;
        })
      } else if (this.eform.value.id != null) {
        this.db.doc('questions/' + this.eform.value.id).update({
          question: this.eform.value.question,
          option1: this.eform.value.option1,
          option2: this.eform.value.option2,
          option3: this.eform.value.option3,
          option4: this.eform.value.option4,
          correct_option: this.eform.value.correct_option,
          mock_test: this.mock_test,
          level: this.eform.value.level,
          subject: this.eform.value.subject
        }).then(resp => {
          this.questionsList = []
          this.db.collection('questions').ref.where('mock_test', 'array-contains' ,this.sForm.value.test).get().then((querySnapshot) => {
            let qno = 1;
              querySnapshot.forEach((data) => {
              const question = Object.assign({}, data.data(), { ['qno']: qno, ['id']: data.id})
              this.questionsList.push(question)
              qno++
            })
            console.log(this.questionsList);
            this.eform.reset();
            this.mock_test = [];
            this.lBtn = false;
          })
        }).catch((err) => {
          alert('Server error! contact admin');
          this.lBtn = false;
        })
      }
    }


  }

 delete(id){
   console.log(id);
   let conf = confirm('Are you sure to delete this question')
   if(conf){
    this.db.doc('questions/'+id).delete().then((resp)=>{
      this.questionsList = []
      this.db.collection('questions').ref.where('mock_test', 'array-contains' ,this.sForm.value.test).get().then((querySnapshot) => {
        let qno = 1;
        querySnapshot.forEach((data) => {
          const question = Object.assign({}, data.data(), { ['qno']: qno, ['id']: data.id})
          this.questionsList.push(question)
          qno++
        })
        console.log(this.questionsList);
     })
     }).catch((err)=>{
       console.log(err)
     })
   }
 }
 edit(fdata){
   const mocks = [] as any
   fdata.mock_test.forEach((element) => {
     mocks.push(element.split('-')[0])
   });

   if(mocks.includes('wbjee')){
    alert("Edit is not available for wbjee exam questions | Contact admin")
   }else{
     this.eform.patchValue({
       id: fdata.id,
       question: fdata.question,
       option1: fdata.option1,
       option2: fdata.option2,
       option3: fdata.option3,
       option4: fdata.option4,
       correct_option: fdata.correct_option,
       test_name: fdata.mock_test,
       level: fdata.level,
       subject: fdata.subject
     });
     this.mock_test = fdata.mock_test;
   }


 }

 onFile(event: any){
   if(event.target.files[0]){
    this.path = event.target.files[0];
     const reader = new FileReader();
     reader.onload = (e:any)=>{
       this.imgSrc = e.target.result;
     }
     reader.readAsDataURL(this.path);
   }else{
     this.imgSrc = "assets/images/placeholder-image.png";
     this.path = null
   }
 }

 upload(){
   console.log(this.path);
   this.uploading = true;
   const filePath = "mock_tests/featured_images/"+this.path.name.split(".")[0]+'_'+new Date().toTimeString().split(" ")[0];

   const fileRef = this.fs.ref(filePath);

   const task = fileRef.put(this.path);

   task.snapshotChanges().pipe(
     finalize(()=>{
       fileRef.getDownloadURL().subscribe((url)=>{
         console.log(url)
         this.uploading = false
       })
     })
   ).subscribe()


  //  this.fs.upload("mock_tests/featured_images/"+this.path.name.split(".")[0]+'_'+new Date().toTimeString().split(" ")[0], this.path).snapshotChanges().subscribe(resp=>{
  //    console.log(resp);
  //  })
 }

 getDetails(){
   this.isql = true;
   this.questionsList = [];
   this.db.collection('questions').ref.where('mock_test', 'array-contains' ,this.sForm.value.test).get().then((querySnapshot) => {
      let qno = 1;
      querySnapshot.forEach((data) => {
        const question = Object.assign({}, data.data(), { ['qno']: qno, ['id']: data.id})
        this.questionsList.push(question)
        qno++
      })
      console.log((this.questionsList))
      this.isql=false;
      this.isqm = false;
    })
 }

 clearSerach(){
   this.sForm.reset();
   this.questionsList=[]
 }

 download(){
  var a = document.createElement("a");
  var file = new Blob([JSON.stringify(this.questionsList)]);
  a.href = URL.createObjectURL(file);
  a.download = 'questionlist.json';
  a.click();
 }

}
