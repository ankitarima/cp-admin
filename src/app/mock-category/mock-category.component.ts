import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { FormControl, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-mock-category',
  templateUrl: './mock-category.component.html',
  styleUrls: ['./mock-category.component.css']
})
export class MockCategoryComponent implements OnInit {

  public lBtn = false;
  public path: any;
  public imgSrc = "assets/images/placeholder-image.png";
  public MTCS = [] as any;
  public slugs = [] as any

  eform = new FormGroup({
    id: new FormControl(null),
    mock_test_category: new FormControl('',Validators['required']),
    slug: new FormControl(''),
    description: new FormControl('', Validators['required']),
    short_description: new FormControl('', Validators['required']),
    featured_image: new FormControl(null)

  });


  constructor(
    private db: AngularFirestore,
  ) { }

  ngOnInit(): void {

    this.db.collection('mock_category').snapshotChanges().subscribe((resp)=>{
      this.MTCS = [];
      this.slugs = [];
      resp.forEach((data:any)=>{
        // console.log(data)
        const review = data.payload.doc.data() as any;
        Object.assign(review,{id: data.payload.doc.id})
        this.MTCS.push(review);
        this.slugs.push(review.slug);
      })

      console.log(this.MTCS);
      // console.log(this.slugs)
    })
  }

  onSubmit(){
    //  console.log(this.eform.value);
      this.lBtn = true;
     if(this.eform.invalid){
       alert('Enter all field');
       this.lBtn = false;
       return
     }else if (this.eform.value.id == null){
      this.lBtn = true;
      const data = this.eform.value;
      delete data.id;
      console.log(this.eform.value);
      if(!this.slugs.includes(this.eform.value.slug )){
        this.db.collection('mock_category').add(data).then(()=>{
            this.eform.reset();
            this.imgSrc = "assets/images/placeholder-image.png";
            this.lBtn = false;
        }).catch((err)=>{
            console.log(err)
        })
      }else{
        alert('Exam with same slug/name already exists')
        this.lBtn = false;
      }
    }else if (this.eform.value.id){
        this.lBtn = true;
        const data = this.eform.value;
        const id = data.id;
        delete data.id;
        console.log(data)
        this.db.doc('mock_category/'+id).update(data).then(()=>{
          this.eform.reset();
          this.imgSrc = "assets/images/placeholder-image.png";
          this.lBtn = false;
        }).catch((err)=>{
            console.log(err)
            this.lBtn = false;
            alert('There is an error occured pls contact admin')
        })
    }

    }

    edit(data:any){
      console.log(data);
      this.imgSrc = data.featured_image || "assets/images/placeholder-image.png";
      this.eform.patchValue(data)
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

    string_to_slug(str) {
      str = str.replace(/^\s+|\s+$/g, ""); // trim
      str = str.toLowerCase();

      // remove accents, swap ñ for n, etc
      var from = "åàáãäâèéëêìíïîòóöôùúüûñç·/_,:;";
      var to = "aaaaaaeeeeiiiioooouuuunc------";

      for (var i = 0, l = from.length; i < l; i++) {
        str = str.replace(new RegExp(from.charAt(i), "g"), to.charAt(i));
      }

      str = str
        .replace(/[^a-z0-9 -]/g, "") // remove invalid chars
        .replace(/\s+/g, "-") // collapse whitespace and replace by -
        .replace(/-+/g, "-") // collapse dashes
        .replace(/^-+/, "") // trim - from start of text
        .replace(/-+$/, ""); // trim - from end of text

      return str;
    }

}
